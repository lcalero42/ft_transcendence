interface UnreadDotProps {
	className?: string;
}

function UnreadDot({ className }: UnreadDotProps) {
	return (
		<span
			aria-hidden
			className={`bg-friends pointer-events-none absolute size-2 rounded-full ${className ?? ""}`}
		/>
	);
}

export default UnreadDot;
