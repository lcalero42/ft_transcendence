import { useEffect } from "react";

const EYES_CLOSED_MS = 2500;
const FALL_ASLEEP_DURATION_MS = 3800;
const EYELID_CLASSES =
	"bg-game-bg absolute -inset-x-[15%] h-[65%] shadow-[0_0_80px_40px_var(--color-game-bg)] motion-reduce:animate-dream-blackout";

interface DreamFallAsleepProps {
	onEyesClosed: () => void;
	onDone: () => void;
}

function DreamFallAsleep({ onEyesClosed, onDone }: DreamFallAsleepProps) {
	useEffect(() => {
		const eyesClosedTimeout = setTimeout(onEyesClosed, EYES_CLOSED_MS);
		const doneTimeout = setTimeout(onDone, FALL_ASLEEP_DURATION_MS);
		return () => {
			clearTimeout(eyesClosedTimeout);
			clearTimeout(doneTimeout);
		};
	}, [onEyesClosed, onDone]);

	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
			<div className={`${EYELID_CLASSES} top-0 rounded-b-[50%] motion-safe:animate-dream-lid-top`} />
			<div className={`${EYELID_CLASSES} bottom-0 rounded-t-[50%] motion-safe:animate-dream-lid-bottom`} />
		</div>
	);
}

export default DreamFallAsleep;
