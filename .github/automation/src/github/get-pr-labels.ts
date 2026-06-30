import type { Octokit } from 'octokit';

interface Params {
	octokit: Octokit;
	owner: string;
	repo: string;
	prNumber: number;
}

export async function getPrLabels({
	octokit,
	owner,
	repo,
	prNumber,
}: Params): Promise<string[]> {
	const response = await octokit.rest.issues.listLabelsOnIssue({
		owner,
		repo,
		issue_number: prNumber,
		per_page: 100,
	});

	return response.data.map((label) => label.name).filter(Boolean);
}
