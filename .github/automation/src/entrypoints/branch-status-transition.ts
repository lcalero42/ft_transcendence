import { readFileSync } from 'node:fs';
import { parseIssueNumberFromBranchName } from '../branches/parse-issue-number-from-branch-name';
import { STATUS_IN_PROGRESS, filterStatusLabels } from '../constants/status-labels';
import { createOctokit, getRepositoryContext } from '../github/create-octokit';
import { getIssueLabels } from '../github/get-issue-labels';
import { replaceIssueLabels } from '../github/replace-issue-labels';
import {
	buildMinimalLabelPatch,
	isEmptyLabelPatch,
} from '../labels/build-minimal-label-patch';
import { computeTargetStatusLabels } from '../labels/compute-target-status-labels';
import { createLogger } from '../logging/create-logger';

interface CreateEventPayload {
	ref?: string;
	ref_type?: string;
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
	const logger = createLogger('[branch-status]');
	const payload = readEventPayload<CreateEventPayload>();

	if (payload.ref_type !== 'branch') {
		logger.info(`ref_type is "${payload.ref_type ?? 'unknown'}"; skip`);
		return;
	}

	const branchName = payload.ref;

	if (!branchName) {
		logger.info('missing branch ref; skip');
		return;
	}

	const issueNumber = parseIssueNumberFromBranchName(branchName);

	if (!issueNumber) {
		logger.info(`branch "${branchName}" does not match issue pattern; skip`);
		return;
	}

	const octokit = createOctokit();
	const { owner, repo } = getRepositoryContext();

	let currentIssueLabels: string[];

	try {
		currentIssueLabels = await getIssueLabels({
			octokit,
			owner,
			repo,
			issueNumber,
		});
	} catch (error) {
		if (isNotFoundError(error)) {
			logger.info(`issue #${issueNumber} not found; skip`);
			return;
		}

		throw error;
	}

	const patch = buildMinimalLabelPatch({
		currentLabels: currentIssueLabels,
		desiredLabels: computeTargetStatusLabels(STATUS_IN_PROGRESS),
		managedLabels: filterStatusLabels(currentIssueLabels),
	});

	if (isEmptyLabelPatch(patch)) {
		logger.info(`issue #${issueNumber} already in target status; no-op`);
		return;
	}

	await replaceIssueLabels({
		octokit,
		owner,
		repo,
		issueNumber,
		patch,
	});

	logger.info(
		`issue #${issueNumber} reconciled; add=${patch.add.length} remove=${patch.remove.length}`,
	);
}

run().catch((error) => {
	const logger = createLogger('[branch-status]');
	const message = error instanceof Error ? error.message : String(error);
	logger.error(message);
	process.exit(1);
});
