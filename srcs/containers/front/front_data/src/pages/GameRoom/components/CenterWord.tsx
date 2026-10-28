import { useState } from "react";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	BADGE_AVATAR_CLASSES,
	BADGE_TONE_CLASSES,
	toEnchantingTable,
	type RevealTone,
} from "@/pages/GameRoom/components/utils";

interface CenterWordProps {
	word: string;
	direction?: number;
	dimmed?: boolean;
	badgeTone?: RevealTone;
	avatarUrl?: string;
	avatarName?: string;
	obscured?: boolean;
	onToggleObscured?: () => void;
}

const PLAIN_WORD_CLASSES = "absolute text-[clamp(24px,2.2vw,48px)] font-bold tracking-wide uppercase";

function CenterWord({
	word,
	direction = 0,
	dimmed,
	badgeTone,
	avatarUrl,
	avatarName,
	obscured,
	onToggleObscured,
}: CenterWordProps) {
	const { t } = useTranslation();
	const [rotation, setRotation] = useState(direction);
	const [prevDirection, setPrevDirection] = useState(direction);

	if (direction !== prevDirection) {
		const shortestDelta = ((direction - prevDirection + 540) % 360) - 180;
		setRotation(rotation + shortestDelta);
		setPrevDirection(direction);
	}

	const arrow = (
		<ArrowUp
			className={`text-game-accent h-[max(11vw,120px)] w-[max(15vw,120px)] transition-[transform,opacity] duration-500 ease-in-out ${dimmed ? "opacity-30" : ""}`}
			strokeWidth={1.5}
			style={{ transform: `rotate(${rotation}deg)` }}
		/>
	);

	return (
		<div className="relative flex items-center justify-center">
			{badgeTone ? (
				<span
					style={{ animationDelay: "1500ms" }}
					className="animate-out fade-out fill-mode-forwards flex duration-300"
				>
					<span
						className={
							badgeTone === "neutral"
								? "animate-arrow-wobble flex"
								: "animate-in spin-in-[720deg] flex duration-[1500ms] ease-out"
						}
					>
						{arrow}
					</span>
				</span>
			) : (
				arrow
			)}
			{badgeTone === "neutral" && (
				<span
					aria-hidden
					style={{ animationDelay: "1000ms" }}
					className="animate-safe-ring border-friends pointer-events-none absolute size-[max(11vw,120px)] rounded-full border-2 shadow-[0_0_24px_var(--color-friends)]/60"
				/>
			)}
			{badgeTone ? (
				<div
					key={word}
					style={{ animationDelay: "1700ms" }}
					className="animate-in fade-in zoom-in-75 fill-mode-backwards absolute flex flex-col items-center gap-2 duration-500"
				>
					{badgeTone === "neutral" && (
						<ShieldCheck
							className="text-friends size-[clamp(64px,7vw,110px)] drop-shadow-[0_0_14px_var(--color-friends)]/60"
							strokeWidth={1.5}
						/>
					)}
					{avatarUrl && (
						<img
							src={avatarUrl}
							alt={avatarName}
							className={`size-[clamp(64px,7vw,110px)] rounded-full border-2 object-cover ${BADGE_AVATAR_CLASSES[badgeTone]}`}
						/>
					)}
					{avatarName && (
						<span className="max-w-[min(30vw,240px)] truncate text-[clamp(14px,1.4vw,28px)] font-bold">
							{avatarName}
						</span>
					)}
					<span
						className={`rounded-2xl border px-4 py-1 text-[clamp(14px,1.4vw,28px)] font-bold tracking-wide uppercase ${BADGE_TONE_CLASSES[badgeTone]}`}
					>
						{word}
					</span>
				</div>
			) : onToggleObscured ? (
				<button
					type="button"
					aria-label={t(obscured ? "game.showWord" : "game.hideWord")}
					title={t(obscured ? "game.showWord" : "game.hideWord")}
					onClick={(event) => {
						event.stopPropagation();
						onToggleObscured();
					}}
					className={`${PLAIN_WORD_CLASSES} cursor-pointer`}
				>
					<span key={String(obscured)} className="animate-in fade-in duration-300">
						{obscured ? toEnchantingTable(word) : word}
					</span>
				</button>
			) : (
				<span className={PLAIN_WORD_CLASSES}>{word}</span>
			)}
		</div>
	);
}

export default CenterWord;
