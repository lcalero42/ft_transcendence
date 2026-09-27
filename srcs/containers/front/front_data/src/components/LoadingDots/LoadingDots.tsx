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

export default LoadingDots;
