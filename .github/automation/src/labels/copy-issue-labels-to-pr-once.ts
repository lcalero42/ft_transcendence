import type { Octokit } from 'octokit';
import { addPrLabels } from '../github/add-pr-labels';
import { filterNonStatusLabels } from './filter-non-status-labels';
import { wasPrLabelCopyAlreadyApplied } from '../pull-requests/was-pr-label-copy-already-applied';
import type { Logger } from '../logging/create-logger';

interface Params {
	octokit: Octokit;
	owner: string;
	repo: string;
	prNumber: number;
	issueLabels: string[];
	prLabels: string[];
	logger: Logger;
}

export async function copyIssueLabelsToPrOnce({
	octokit,
	owner,
	repo,
	prNumber,
	issueLabels,
	prLabels,
	logger,
}: Params): Promise<void> {
	const issueNonStatusLabels = filterNonStatusLabels(issueLabels);

	if (issueNonStatusLabels.length === 0) {
		logger.info('no non-status issue labels to copy');
		return;
	}

	if (wasPrLabelCopyAlreadyApplied(issueNonStatusLabels, prLabels)) {
		logger.info('label copy already satisfied; no-op');
		return;
	}

	const currentPrLabels = new Set(prLabels);
	const labelsToAdd = issueNonStatusLabels.filter((label) => !currentPrLabels.has(label));

	if (labelsToAdd.length === 0) {
		logger.info('no missing non-status labels to copy');
		return;
	}

	await addPrLabels({
		octokit,
		owner,
		repo,
		prNumber,
		labels: labelsToAdd,
	});

	logger.info(`copied ${labelsToAdd.length} non-status label(s)`);
}
