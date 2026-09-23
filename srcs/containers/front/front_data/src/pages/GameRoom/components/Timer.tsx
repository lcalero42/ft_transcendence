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
			className="card mb-0! w-fit flex-row items-center gap-[max(0.94vw,11px)] px-[max(0.67vw,13px)]"
			style={{ backgroundColor: "#0D0A2D", borderColor: "#140F39", borderWidth: "4px", borderStyle: "solid" }}
		>
			<TimerIcon className="text-accent-purple size-[clamp(22px,2.66vw,47px)] shrink-0" />
			<div className="flex flex-col items-start">
				<span className="text-gray-low">Timer</span>
				<span className="text-[clamp(19px,2vw,26px)] font-bold">{formatTime(secondsLeft)}</span>
			</div>
		</div>
	);
}

export default Timer;
