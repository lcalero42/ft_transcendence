export const BRANCH_ISSUE_PATTERN =
	/^(?<type>[a-z0-9][a-z0-9._-]*)\/#?(?<issueNumber>\d+)-(?<slug>[a-z0-9][a-z0-9._-]*)$/i;

export function parseIssueNumberFromBranchName(branchName: string): number | null {
	const match = branchName.match(BRANCH_ISSUE_PATTERN);

	if (!match?.groups?.issueNumber) {
		return null;
	}

	const issueNumber = Number.parseInt(match.groups.issueNumber, 10);
	return Number.isInteger(issueNumber) && issueNumber > 0 ? issueNumber : null;
}
