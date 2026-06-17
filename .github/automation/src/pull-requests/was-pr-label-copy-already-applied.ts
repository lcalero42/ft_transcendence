export function wasPrLabelCopyAlreadyApplied(
	issueNonStatusLabels: string[],
	prLabels: string[],
): boolean {
	if (issueNonStatusLabels.length === 0) {
		return true;
	}

	const currentPrLabels = new Set(prLabels);
	return issueNonStatusLabels.every((label) => currentPrLabels.has(label));
}
