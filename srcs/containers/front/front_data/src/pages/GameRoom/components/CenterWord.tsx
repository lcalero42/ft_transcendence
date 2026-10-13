import { useState } from "react";
import { ArrowUp } from "lucide-react";

interface CenterWordProps {
	word: string;
	direction?: number;
	dimmed?: boolean;
}

function CenterWord({ word, direction = 0, dimmed }: CenterWordProps) {
	const [rotation, setRotation] = useState(direction);
	const [prevDirection, setPrevDirection] = useState(direction);

	if (direction !== prevDirection) {
		const shortestDelta = ((direction - prevDirection + 540) % 360) - 180;
		setRotation(rotation + shortestDelta);
		setPrevDirection(direction);
	}

	return (
		<div className="relative flex items-center justify-center">
			<ArrowUp
				className={`h-[max(11vw,120px)] w-[max(15vw,120px)] transition-[transform,opacity] duration-500 ease-in-out ${dimmed ? "opacity-30" : ""}`}
				strokeWidth={1.5}
				style={{ transform: `rotate(${rotation}deg)`, color: "#8B57FB" }}
			/>
			<span className="absolute text-[clamp(24px,2.2vw,48px)] font-bold tracking-wide uppercase">
				{word}
			</span>
		</div>
	);
}

export default CenterWord;
