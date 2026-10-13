import { useId } from "react";

export function DashedOrbit() {
	const gradientId = useId();

	return (
		<svg aria-hidden>
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" />
					<stop offset="50%" />
					<stop offset="100%" />
				</linearGradient>
			</defs>
			<rect stroke={`url(#${gradientId})`} />
		</svg>
	);
}
