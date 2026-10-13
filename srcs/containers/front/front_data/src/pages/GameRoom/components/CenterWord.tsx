import { useState } from "react";
import { ArrowUp } from "lucide-react";

interface CenterWordProps {
	word: string;
	direction?: number;
	dimmed?: boolean;
	badgeTone?: "victory" | "defeat";
	avatarUrl?: string;
	avatarName?: string;
}

const BADGE_TONE_CLASSES = {
	victory: "border-victory/60 bg-victory/10 text-victory",
	defeat: "border-defeat/60 bg-defeat/10 text-defeat",
};

const BADGE_AVATAR_CLASSES = {
	victory: "border-victory shadow-[0_0_18px_#45E26D66]",
	defeat: "border-defeat shadow-[0_0_18px_#F04C4C66]",
};

function CenterWord({ word, direction = 0, dimmed, badgeTone, avatarUrl, avatarName }: CenterWordProps) {
	const [rotation, setRotation] = useState(direction);
	const [prevDirection, setPrevDirection] = useState(direction);

	if (direction !== prevDirection) {
		const shortestDelta = ((direction - prevDirection + 540) % 360) - 180;
		setRotation(rotation + shortestDelta);
		setPrevDirection(direction);
	}

	const arrow = (
		<ArrowUp
			className={`h-[max(11vw,120px)] w-[max(15vw,120px)] transition-[transform,opacity] duration-500 ease-in-out ${dimmed ? "opacity-30" : ""}`}
			strokeWidth={1.5}
			style={{ transform: `rotate(${rotation}deg)`, color: "#8B57FB" }}
		/>
	);

	return (
		<div className="relative flex items-center justify-center">
			{badgeTone ? (
				<span
					style={{ animationDelay: "1500ms" }}
					className="animate-out fade-out fill-mode-forwards flex duration-300"
				>
					<span className="animate-in spin-in-[720deg] flex duration-[1500ms] ease-out">{arrow}</span>
				</span>
			) : (
				arrow
			)}
			{badgeTone ? (
				<div
					key={word}
					style={{ animationDelay: "1700ms" }}
					className="animate-in fade-in zoom-in-75 fill-mode-backwards absolute flex flex-col items-center gap-2 duration-500"
				>
					{avatarUrl && (
						<img
							src={avatarUrl}
							alt={avatarName}
							className={`size-[clamp(64px,7vw,110px)] rounded-full border-2 object-cover ${BADGE_AVATAR_CLASSES[badgeTone]}`}
						/>
					)}
					<span
						className={`rounded-2xl border px-4 py-1 text-[clamp(14px,1.4vw,28px)] font-bold tracking-wide uppercase ${BADGE_TONE_CLASSES[badgeTone]}`}
					>
						{word}
					</span>
				</div>
			) : (
				<span className="absolute text-[clamp(24px,2.2vw,48px)] font-bold tracking-wide uppercase">
					{word}
				</span>
			)}
		</div>
	);
}

export default CenterWord;
