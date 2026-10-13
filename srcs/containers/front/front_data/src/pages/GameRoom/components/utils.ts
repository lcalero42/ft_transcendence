export type RevealTone = "victory" | "defeat";

export const BADGE_TONE_CLASSES: Record<RevealTone, string> = {
	victory: "border-victory/60 bg-victory/10 text-victory",
	defeat: "border-defeat/60 bg-defeat/10 text-defeat",
};

export const BADGE_AVATAR_CLASSES: Record<RevealTone, string> = {
	victory: "border-victory shadow-[0_0_18px_#45E26D66]",
	defeat: "border-defeat shadow-[0_0_18px_#F04C4C66]",
};

export function getPlayerAngleDeg(index: number, total: number) {
	return total > 0 ? (index / total) * 360 : 0;
}

export function formatChatTime(sentAt: number) {
	return new Date(sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
