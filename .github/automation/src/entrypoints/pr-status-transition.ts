import { readFileSync } from 'node:fs';
import { STATUS_IN_REVIEW, filterStatusLabels } from '../constants/status-labels';
import { createOctokit, getRepositoryContext } from '../github/create-octokit';
import { getIssueLabels } from '../github/get-issue-labels';
import { getPrLabels } from '../github/get-pr-labels';
import { replaceIssueLabels } from '../github/replace-issue-labels';
import { replacePrLabels } from '../github/replace-pr-labels';
import {
	buildMinimalLabelPatch,
	isEmptyLabelPatch,
} from '../labels/build-minimal-label-patch';
import { computeTargetStatusLabels } from '../labels/compute-target-status-labels';
import { copyIssueLabelsToPrOnce } from '../labels/copy-issue-labels-to-pr-once';
import { createLogger } from '../logging/create-logger';
import { resolveIssueNumberFromPrBranch } from '../pull-requests/resolve-issue-number-from-pr-branch';

interface PullRequestTargetEventPayload {
	pull_request?: {
		number?: number;
		head?: {
			ref?: string;
		};
	};
}

function readEventPayload<T>(): T {
	const eventPath = process.env.GITHUB_EVENT_PATH;

	if (!eventPath) {
		throw new Error('Missing GITHUB_EVENT_PATH');
	}

	return JSON.parse(readFileSync(eventPath, 'utf8')) as T;
}

function isNotFoundError(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'status' in error &&
		(error as { status?: number }).status === 404
	);
}

async function run(): Promise<void> {
	const logger = createLogger('[pr-status]');
	const payload = readEventPayload<PullRequestTargetEventPayload>();

	const prNumber = payload.pull_request?.number;
	const branchName = payload.pull_request?.head?.ref;

	if (!prNumber || !branchName) {
		logger.info('missing pr number or head ref; skip');
		return;
	}

	const issueNumber = resolveIssueNumberFromPrBranch(branchName);

	if (!issueNumber) {
		logger.info(`branch "${branchName}" does not match issue pattern; skip`);
		return;
	}

	const octokit = createOctokit();
	const { owner, repo } = getRepositoryContext();

	let issueLabels: string[];
	let prLabels: string[];

	try {
		[issueLabels, prLabels] = await Promise.all([
			getIssueLabels({
				octokit,
				owner,
				repo,
				issueNumber,
			}),
			getPrLabels({
				octokit,
				owner,
				repo,
				prNumber,
			}),
		]);
	} catch (error) {
		if (isNotFoundError(error)) {
			logger.info(`issue #${issueNumber} or pr #${prNumber} not found; skip`);
			return;
		}

		throw error;
	}

	const desiredStatusLabels = computeTargetStatusLabels(STATUS_IN_REVIEW);

	const issuePatch = buildMinimalLabelPatch({
		currentLabels: issueLabels,
		desiredLabels: desiredStatusLabels,
		managedLabels: filterStatusLabels(issueLabels),
	});

	if (!isEmptyLabelPatch(issuePatch)) {
		await replaceIssueLabels({
			octokit,
			owner,
			repo,
			issueNumber,
			patch: issuePatch,
		});
	}

	const prPatch = buildMinimalLabelPatch({
		currentLabels: prLabels,
		desiredLabels: desiredStatusLabels,
		managedLabels: filterStatusLabels(prLabels),
	});

	if (!isEmptyLabelPatch(prPatch)) {
		await replacePrLabels({
			octokit,
			owner,
			repo,
			prNumber,
			patch: prPatch,
		});
	}

	await copyIssueLabelsToPrOnce({
		octokit,
		owner,
		repo,
		prNumber,
		issueLabels,
		prLabels: [
			...prLabels.filter((label) => !prPatch.remove.includes(label)),
			...prPatch.add,
		],
		logger: createLogger('[label-copy]'),
	});

	logger.info(
		`issue #${issueNumber} and pr #${prNumber} reconciled; issue(add=${issuePatch.add.length}, remove=${issuePatch.remove.length}) pr(add=${prPatch.add.length}, remove=${prPatch.remove.length})`,
	);
}

run().catch((error) => {
	const logger = createLogger('[pr-status]');
	const message = error instanceof Error ? error.message : String(error);
	logger.error(message);
	process.exit(1);
});
