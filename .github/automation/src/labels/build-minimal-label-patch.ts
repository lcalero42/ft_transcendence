export interface LabelPatch {
	add: string[];
	remove: string[];
}

interface Params {
	currentLabels: string[];
	desiredLabels: string[];
	managedLabels: string[];
}

function toUniqueLabels(labels: string[]): string[] {
	return [...new Set(labels)];
}

export function buildMinimalLabelPatch({
	currentLabels,
	desiredLabels,
	managedLabels,
}: Params): LabelPatch {
	const current = new Set(toUniqueLabels(currentLabels));
	const desired = new Set(toUniqueLabels(desiredLabels));
	const managed = toUniqueLabels(managedLabels);

	const remove = managed.filter((label) => current.has(label) && !desired.has(label));
	const add = [...desired].filter((label) => !current.has(label));

	return { add, remove };
}

export function isEmptyLabelPatch(patch: LabelPatch): boolean {
	return patch.add.length === 0 && patch.remove.length === 0;
}
