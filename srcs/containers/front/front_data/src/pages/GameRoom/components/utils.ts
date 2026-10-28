export type RevealTone = "victory" | "defeat" | "neutral";

export const BADGE_TONE_CLASSES: Record<RevealTone, string> = {
	victory: "border-victory/60 bg-victory/10 text-victory",
	defeat: "border-defeat/60 bg-defeat/10 text-defeat",
	neutral: "border-friends/60 bg-friends/10 text-friends",
};

export const BADGE_AVATAR_CLASSES: Record<RevealTone, string> = {
	victory: "border-victory shadow-[0_0_18px_var(--color-victory)]/40",
	defeat: "border-defeat shadow-[0_0_18px_var(--color-defeat)]/40",
	neutral: "border-friends shadow-[0_0_18px_var(--color-friends)]/40",
};

const ENCHANTING_GLYPHS: Record<string, string> = {
	a: "ᔑ",
	b: "ʖ",
	c: "ᓵ",
	d: "↸",
	e: "ᒷ",
	f: "⎓",
	g: "⊣",
	h: "⍑",
	i: "╎",
	j: "⋮",
	k: "ꖌ",
	l: "ꖎ",
	m: "ᒲ",
	n: "リ",
	o: "𝙹",
	p: "!¡",
	q: "ᑑ",
	r: "∷",
	s: "ᓭ",
	t: "ℸ̣",
	u: "⚍",
	v: "⍊",
	w: "∴",
	x: "/̇",
	y: "||",
	z: "⨅",
};

export function toEnchantingTable(word: string) {
	return Array.from(word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase())
		.map((char) => ENCHANTING_GLYPHS[char] ?? char)
		.join("");
}

export function getPlayerAngleDeg(index: number, total: number) {
	return total > 0 ? (index / total) * 360 : 0;
}

export function formatChatTime(sentAt: number) {
	return new Date(sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
