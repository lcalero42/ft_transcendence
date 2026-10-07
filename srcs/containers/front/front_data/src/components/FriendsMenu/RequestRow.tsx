import type { ReactNode } from "react";
import { getAvatarUrl } from "@/api/player";

type RequestRowProps = {
	avatarUrl: string | null;
	name: string;
	children: ReactNode;
};

function RequestRow({ avatarUrl, name, children }: RequestRowProps) {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-card px-4 py-2">
			<img
				src={getAvatarUrl(avatarUrl)}
				alt=""
				className="h-9 w-9 shrink-0 rounded-full object-cover"
			/>
			<div className="flex-1 truncate text-sm font-medium">{name}</div>
			{children}
		</div>
	);
}

export default RequestRow;
