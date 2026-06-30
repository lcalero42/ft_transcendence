import type { StatusLabel } from '../constants/status-labels';

export function computeTargetStatusLabels(nextStatus: StatusLabel | null): string[] {
	return nextStatus ? [nextStatus] : [];
}
