import type { Octokit } from 'octokit';
import type { LabelPatch } from '../labels/build-minimal-label-patch';

interface Params {
	octokit: Octokit;
	owner: string;
	repo: string;
	prNumber: number;
	patch: LabelPatch;
}

export async function replacePrLabels({
	octokit,
	owner,
	repo,
	prNumber,
	patch,
}: Params): Promise<void> {
	for (const label of patch.remove) {
		await octokit.rest.issues.removeLabel({
			owner,
			repo,
			issue_number: prNumber,
			name: label,
		});
	}

	if (patch.add.length > 0) {
		await octokit.rest.issues.addLabels({
			owner,
			repo,
			issue_number: prNumber,
			labels: patch.add,
		});
	}
}
