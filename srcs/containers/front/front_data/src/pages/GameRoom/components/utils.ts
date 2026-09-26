export function getPlayerAngleDeg(index: number, total: number) {
	return total > 0 ? (index / total) * 360 : 0;
}

export function formatChatTime(sentAt: number) {
	return new Date(sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
