import { parseIssueNumberFromBranchName } from '../branches/parse-issue-number-from-branch-name';

export function resolveIssueNumberFromPrBranch(branchName: string): number | null {
	return parseIssueNumberFromBranchName(branchName);
}
