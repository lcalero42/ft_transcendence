import { Timer as TimerIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TimerProps {
	secondsLeft: number;
}

function formatTime(secondsLeft: number) {
	const minutes = Math.floor(secondsLeft / 60);
	const seconds = secondsLeft % 60;
	return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function Timer({ secondsLeft }: TimerProps) {
	const { t } = useTranslation();

	return (
		<div className="card border-timer-border bg-timer-bg mb-0! w-fit flex-row items-center gap-[max(0.94vw,11px)] border-4 px-[max(0.67vw,13px)] py-1.5 md:py-4">
			<TimerIcon className="text-accent-purple size-[clamp(22px,2.66vw,47px)] shrink-0" />
			<div className="flex flex-col items-start">
				<span className="text-gray-low hidden md:inline">{t("game.timer")}</span>
				<span className="text-[clamp(19px,2vw,26px)] font-bold">
					{[...formatTime(secondsLeft)].map((char, index) => (
						<span key={index} className={char === ":" ? "" : "inline-block w-[1ch] text-center"}>
							{char}
						</span>
					))}
				</span>
			</div>
		</div>
	);
}

export default Timer;
