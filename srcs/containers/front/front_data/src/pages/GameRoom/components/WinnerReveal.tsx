import {
	BADGE_AVATAR_CLASSES,
	BADGE_TONE_CLASSES,
	type RevealTone,
} from "@/pages/GameRoom/components/utils";

interface Winner {
	sessionId: string;
	name: string;
	avatarUrl?: string;
}

interface WinnerRevealProps {
	winners: Winner[];
	label: string;
	tone: RevealTone;
}

const STAGGER_MS = 150;

function WinnerReveal({ winners, label, tone }: WinnerRevealProps) {
	const isSolo = winners.length === 1;

	return (
		<div className="flex max-w-[50%] flex-col items-center gap-3">
			<div className="flex flex-wrap items-center justify-center gap-3">
				{winners.map((winner, index) => (
					<div
						key={winner.sessionId}
						style={{ animationDelay: `${index * STAGGER_MS}ms` }}
						className="animate-in fade-in zoom-in-75 fill-mode-backwards flex flex-col items-center gap-2 duration-500"
					>
						<img
							src={winner.avatarUrl}
							alt={winner.name}
							className={`rounded-full border-2 object-cover ${BADGE_AVATAR_CLASSES[tone]} ${isSolo ? "size-[clamp(64px,7vw,110px)]" : "size-[clamp(40px,4vw,72px)]"}`}
						/>
						<span className={`font-bold ${isSolo ? "text-[clamp(14px,1.4vw,28px)]" : "text-small"}`}>
							{winner.name}
						</span>
					</div>
				))}
			</div>
			<span
				style={{ animationDelay: `${winners.length * STAGGER_MS}ms` }}
				className={`animate-in fade-in zoom-in-75 fill-mode-backwards rounded-2xl border px-4 py-1 text-[clamp(14px,1.4vw,28px)] font-bold tracking-wide uppercase duration-500 ${BADGE_TONE_CLASSES[tone]}`}
			>
				{label}
			</span>
		</div>
	);
}

export default WinnerReveal;
