import type { Octokit } from 'octokit';
import type { LabelPatch } from '../labels/build-minimal-label-patch';

interface Params {
	octokit: Octokit;
	owner: string;
	repo: string;
	issueNumber: number;
	patch: LabelPatch;
}

export async function replaceIssueLabels({
	octokit,
	owner,
	repo,
	issueNumber,
	patch,
}: Params): Promise<void> {
	for (const label of patch.remove) {
		await octokit.rest.issues.removeLabel({
			owner,
			repo,
			issue_number: issueNumber,
			name: label,
		});
	}

	if (patch.add.length > 0) {
		await octokit.rest.issues.addLabels({
			owner,
			repo,
			issue_number: issueNumber,
			labels: patch.add,
		});
	}
}
