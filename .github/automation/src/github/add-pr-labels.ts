import type { Octokit } from 'octokit';

interface Params {
	octokit: Octokit;
	owner: string;
	repo: string;
	prNumber: number;
	labels: string[];
}

export async function addPrLabels({
	octokit,
	owner,
	repo,
	prNumber,
	labels,
}: Params): Promise<void> {
	if (labels.length === 0) {
		return;
	}

	await octokit.rest.issues.addLabels({
		owner,
		repo,
		issue_number: prNumber,
		labels,
	});
}
