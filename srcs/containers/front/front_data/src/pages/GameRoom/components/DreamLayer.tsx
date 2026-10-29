const STARS = Array.from({ length: 40 }, (_, index) => ({
	left: `${((0.5 + index * 0.7548776662) % 1) * 100}%`,
	top: `${((0.5 + index * 0.5698402911) % 1) * 100}%`,
	size: 1 + (index % 3),
	animationDuration: `${2 + (index % 5) * 0.6}s`,
	animationDelay: `${-(index % 7) * 0.5}s`,
}));

const BUBBLES = Array.from({ length: 14 }, (_, index) => ({
	left: `${((0.3 + index * 0.6180339887) % 1) * 100}%`,
	size: 6 + (index % 4) * 3,
	animationDuration: `${14 + (index % 5) * 3}s`,
	animationDelay: `${-index * 2.3}s`,
}));

const BLOB_CLASSES = "absolute rounded-full bg-radial to-transparent to-70% motion-safe:animate-dream-drift";

function DreamLayer() {
	return (
		<>
			<div
				aria-hidden
				className="animate-in fade-in pointer-events-none fixed inset-0 -z-20 overflow-hidden duration-1000"
			>
				<div className={`${BLOB_CLASSES} from-dream-1/45 -top-[25%] -left-[15%] size-[70vmax]`} />
				<div
					style={{ animationDelay: "-10s", animationDuration: "36s" }}
					className={`${BLOB_CLASSES} from-dream-2/35 top-[15%] -right-[20%] size-[60vmax]`}
				/>
				<div
					style={{ animationDelay: "-20s", animationDuration: "42s" }}
					className={`${BLOB_CLASSES} from-dream-3/40 -bottom-[30%] left-[15%] size-[65vmax]`}
				/>
				{STARS.map((star, index) => (
					<span
						key={index}
						style={{
							left: star.left,
							top: star.top,
							width: star.size,
							height: star.size,
							animationDuration: star.animationDuration,
							animationDelay: star.animationDelay,
						}}
						className="absolute rounded-full bg-white shadow-[0_0_6px_var(--color-white)] motion-safe:animate-dream-twinkle"
					/>
				))}
				{BUBBLES.map((bubble, index) => (
					<span
						key={index}
						style={{
							left: bubble.left,
							width: bubble.size,
							height: bubble.size,
							animationDuration: bubble.animationDuration,
							animationDelay: bubble.animationDelay,
						}}
						className="bg-dream-2/30 border-dream-2/50 absolute -bottom-[5%] rounded-full border shadow-[0_0_14px_var(--color-dream-2)]/50 motion-safe:animate-dream-rise motion-reduce:hidden"
					/>
				))}
			</div>
			<div
				aria-hidden
				className="dream-vignette animate-in fade-in pointer-events-none fixed inset-0 z-30 duration-1000"
			/>
		</>
	);
}

export default DreamLayer;
