import { Meteors } from "@/components/ui/meteors";

function ShootingStars() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden">
			<Meteors
				number={8}
				minDelay={0}
				maxDelay={8}
				minDuration={4}
				maxDuration={10}
				className="bg-gray-high [&>div]:from-gray-high"
			/>
		</div>
	);
}

export default ShootingStars;
