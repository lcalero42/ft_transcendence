import { isStatusLabel } from '../constants/status-labels';

export function filterNonStatusLabels(labels: string[]): string[] {
	return labels.filter((label) => !isStatusLabel(label));
}
