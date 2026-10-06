interface Winner {
	sessionId: string;
	name: string;
	avatarUrl?: string;
}

interface WinnerRevealProps {
	winners: Winner[];
	label: string;
}

function WinnerReveal({ winners, label }: WinnerRevealProps) {
	const isSolo = winners.length === 1;

	return (
		<div className="animate-in fade-in zoom-in-50 flex max-w-[50%] flex-col items-center gap-3 duration-700">
			<div className="flex flex-wrap items-center justify-center gap-3">
				{winners.map((winner) => (
					<div key={winner.sessionId} className="flex flex-col items-center gap-1">
						<img
							src={winner.avatarUrl}
							alt={winner.name}
							className={`border-winrate rounded-full border-4 object-cover ${isSolo ? "size-[clamp(80px,8vw,140px)]" : "size-[clamp(40px,4vw,72px)]"}`}
						/>
						<span className={`font-bold ${isSolo ? "text-[clamp(20px,2vw,36px)]" : "text-small"}`}>
							{winner.name}
						</span>
					</div>
				))}
			</div>
			<span className="text-winrate text-[clamp(18px,1.6vw,30px)] font-bold tracking-wide uppercase">{label}</span>
		</div>
	);
}

export default WinnerReveal;
