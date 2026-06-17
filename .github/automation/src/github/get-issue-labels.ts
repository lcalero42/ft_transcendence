import type { Octokit } from 'octokit';

interface Params {
	octokit: Octokit;
	owner: string;
	repo: string;
	issueNumber: number;
}

export async function getIssueLabels({
	octokit,
	owner,
	repo,
	issueNumber,
}: Params): Promise<string[]> {
	const response = await octokit.rest.issues.listLabelsOnIssue({
		owner,
		repo,
		issue_number: issueNumber,
		per_page: 100,
	});

	return response.data.map((label) => label.name).filter(Boolean);
}
