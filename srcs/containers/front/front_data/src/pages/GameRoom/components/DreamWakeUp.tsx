import { useEffect } from "react";

const WAKE_UP_TEXT = "…it was all a dream";
const WAKE_UP_DURATION_MS = 4500;

interface DreamWakeUpProps {
	onDone: () => void;
}

function DreamWakeUp({ onDone }: DreamWakeUpProps) {
	useEffect(() => {
		const timeout = setTimeout(onDone, WAKE_UP_DURATION_MS);
		return () => clearTimeout(timeout);
	}, [onDone]);

	return (
		<div
			style={{ animationDelay: "3800ms" }}
			className="animate-out fade-out fill-mode-forwards fixed inset-0 z-[100] duration-700"
		>
			<div className="animate-in fade-in bg-bg-deep flex size-full items-center justify-center duration-700">
				<p aria-label={WAKE_UP_TEXT} className="text-gray-high text-title px-6 text-center font-bold italic">
					{Array.from(WAKE_UP_TEXT).map((char, index) => (
						<span
							key={index}
							aria-hidden
							style={{ animationDelay: `${800 + index * 90}ms` }}
							className="animate-in fade-in fill-mode-backwards duration-300"
						>
							{char}
						</span>
					))}
				</p>
			</div>
		</div>
	);
}

export default DreamWakeUp;
