import { useState } from "react";

export function useHasUnread<T extends { sessionId: string }>(
	items: readonly T[] | undefined,
	getTime: (item: T) => number,
	selfSessionId: string,
	visible: boolean,
) {
	const [seenAt, setSeenAt] = useState<number | null>(null);
	const latest = items && items.length > 0 ? getTime(items[items.length - 1]) : 0;

	if (items && (seenAt === null || (visible && seenAt !== latest))) {
		setSeenAt(latest);
	}

	if (!items || seenAt === null || visible) return false;
	return items.some((item) => getTime(item) > seenAt && item.sessionId !== selfSessionId);
}
