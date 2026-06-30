export const STATUS_LABEL_PREFIX = 'status:';

export const STATUS_TO_DO = 'status:to-do';
export const STATUS_IN_PROGRESS = 'status:in-progress';
export const STATUS_IN_REVIEW = 'status:in-review';
export const STATUS_BLOCKED = 'status:blocked';

export const ALL_STATUS_LABELS = [
	STATUS_TO_DO,
	STATUS_IN_PROGRESS,
	STATUS_IN_REVIEW,
	STATUS_BLOCKED,
] as const;

export type StatusLabel = (typeof ALL_STATUS_LABELS)[number];

export function isStatusLabel(label: string): label is StatusLabel {
	return label.startsWith(STATUS_LABEL_PREFIX);
}

export function filterStatusLabels(labels: string[]): string[] {
	return labels.filter(isStatusLabel);
}
