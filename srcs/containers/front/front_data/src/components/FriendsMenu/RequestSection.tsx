import type { ReactNode } from "react";

type RequestSectionProps = {
	label: string;
	count: number;
	children: ReactNode;
};

function RequestSection({ label, count, children }: RequestSectionProps) {
	if (count === 0) return null;

	return (
		<div>
			<div className="mb-2 font-semibold text-accent-purple">
				{label} ({count})
			</div>
			<div className="flex flex-col gap-2">{children}</div>
		</div>
	);
}

export default RequestSection;
