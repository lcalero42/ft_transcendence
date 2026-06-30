import { readFileSync } from 'node:fs';
import { filterStatusLabels } from '../constants/status-labels';
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
import { createLogger } from '../logging/create-logger';
import { resolveIssueNumberFromPrBranch } from '../pull-requests/resolve-issue-number-from-pr-branch';

interface PullRequestClosedEventPayload {
	pull_request?: {
		number?: number;
		merged?: boolean;
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
	const logger = createLogger('[merge-cleanup]');
	const payload = readEventPayload<PullRequestClosedEventPayload>();

	const prNumber = payload.pull_request?.number;
	const merged = payload.pull_request?.merged;
	const branchName = payload.pull_request?.head?.ref;

	if (!merged) {
		logger.info('pr not merged; skip');
		return;
	}

	if (!prNumber) {
		logger.info('missing pr number; skip');
		return;
	}

	const octokit = createOctokit();
	const { owner, repo } = getRepositoryContext();

	let prLabels: string[];

	try {
		prLabels = await getPrLabels({
			octokit,
			owner,
			repo,
			prNumber,
		});
	} catch (error) {
		if (isNotFoundError(error)) {
			logger.info(`pr #${prNumber} not found; skip`);
			return;
		}

		throw error;
	}

	const prPatch = buildMinimalLabelPatch({
		currentLabels: prLabels,
		desiredLabels: computeTargetStatusLabels(null),
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

	if (!branchName) {
		logger.info(`pr #${prNumber} cleaned; missing head ref prevented issue cleanup`);
		return;
	}

	const issueNumber = resolveIssueNumberFromPrBranch(branchName);

	if (!issueNumber) {
		logger.info(`pr #${prNumber} cleaned; branch "${branchName}" did not resolve an issue`);
		return;
	}

	let issueLabels: string[];

	try {
		issueLabels = await getIssueLabels({
			octokit,
			owner,
			repo,
			issueNumber,
		});
	} catch (error) {
		if (isNotFoundError(error)) {
			logger.info(`pr #${prNumber} cleaned; issue #${issueNumber} not found`);
			return;
		}

		throw error;
	}

	const issuePatch = buildMinimalLabelPatch({
		currentLabels: issueLabels,
		desiredLabels: computeTargetStatusLabels(null),
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

	logger.info(
		`cleanup complete; pr #${prNumber} (add=${prPatch.add.length}, remove=${prPatch.remove.length}) issue #${issueNumber} (add=${issuePatch.add.length}, remove=${issuePatch.remove.length})`,
	);
}

run().catch((error) => {
	const logger = createLogger('[merge-cleanup]');
	const message = error instanceof Error ? error.message : String(error);
	logger.error(message);
	process.exit(1);
});
