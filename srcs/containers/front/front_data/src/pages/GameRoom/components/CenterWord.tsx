import { ArrowUp } from "lucide-react";

interface CenterWordProps {
	word: string;
	direction?: number;
}

function CenterWord({ word, direction = 0 }: CenterWordProps) {
	return (
		<div className="relative flex items-center justify-center">
			<ArrowUp
				className="text-accent-purple size-32 sm:size-44 md:size-56"
				strokeWidth={2.5}
				style={{ transform: `rotate(${direction}deg)` }}
			/>
			<span className="absolute text-3xl font-bold tracking-wide uppercase sm:text-4xl md:text-5xl">
				{word}
			</span>
		</div>
	);
}

export default CenterWord;
