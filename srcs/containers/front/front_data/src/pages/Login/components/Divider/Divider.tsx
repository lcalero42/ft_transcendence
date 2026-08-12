type DividerProps = {
	label: string;
};

function Divider({ label }: DividerProps) {
	return (
		<div className="flex items-center justify-center gap-4">
			<div className="flex-1 border-t border-card-border" />
			<p className="text-xs text-gray-low whitespace-nowrap">{label}</p>
			<div className="flex-1 border-t border-card-border" />
		</div>
	);
}

export default Divider;
