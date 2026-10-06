import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from 'react';

function LoadingDots() {
	const [dots, setDots]= useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setDots((d) => (d + 1) % 4);
		}, 400);
		return () => clearInterval(interval);
	}, []);

	return (
	    <span className="inline-block w-[1.5em] text-left">
			{". ".repeat(dots)}
		</span>
	);
}

interface LoadPageProps {
  text?: string;
}

function LoadPage({ text = "Loading" }: LoadPageProps) {
	return (
		<div className="page flex flex-col items-center justify-center gap-4 py-20">
			<Spinner className="size-10 text-accent-hover" />
			<p className="text-accent-hover font-bold">
				{text} <LoadingDots />
			</p>
		</div>
	);
}

export default LoadPage;
