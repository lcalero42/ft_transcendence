import { ArrowUp } from "lucide-react";

interface CenterWordProps {
	word: string;
	direction?: number;
}

function CenterWord({ word, direction = 0 }: CenterWordProps) {
	return (
		<div className="relative flex items-center justify-center">
			<ArrowUp
				className="text-accent-purple size-[max(15vw,120px)]"
				strokeWidth={2.5}
				style={{ transform: `rotate(${direction}deg)` }}
			/>
			<span className="absolute text-[clamp(24px,2.2vw,48px)] font-bold tracking-wide uppercase">
				{word}
			</span>
		</div>
	);
}

export default CenterWord;
