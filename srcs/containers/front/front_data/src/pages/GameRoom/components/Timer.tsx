import { Timer as TimerIcon } from "lucide-react";

interface TimerProps {
	secondsLeft: number;
}

function formatTime(secondsLeft: number) {
	const minutes = Math.floor(secondsLeft / 60);
	const seconds = secondsLeft % 60;
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function Timer({ secondsLeft }: TimerProps) {
	return (
		<div
			className="card mb-0! w-fit flex-row items-center gap-[max(0.6vw,8px)] p-[max(0.9vw,10px)]"
			style={{ backgroundColor: "#0D0A2D", borderColor: "#140F39", borderWidth: "4px", borderStyle: "solid" }}
		>
			<TimerIcon className="text-accent-purple size-[clamp(16px,1.2vw,26px)] shrink-0" />
			<div className="flex flex-col items-start">
				<span className="text-gray-low text-small">Timer</span>
				<span className="text-[clamp(14px,1vw,24px)] font-bold">{formatTime(secondsLeft)}</span>
			</div>
		</div>
	);
}

export default Timer;
