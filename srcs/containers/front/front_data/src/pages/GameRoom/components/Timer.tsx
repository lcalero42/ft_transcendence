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
		<div className="card mb-0! w-fit flex-row items-center gap-3">
			<TimerIcon className="text-accent-purple shrink-0" size={28} />
			<div className="flex flex-col items-start">
				<span className="text-gray-low text-sm">Timer</span>
				<span className="text-xl font-bold">{formatTime(secondsLeft)}</span>
			</div>
		</div>
	);
}

export default Timer;
