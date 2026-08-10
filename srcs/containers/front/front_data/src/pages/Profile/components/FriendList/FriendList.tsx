type FriendProps = {
	id: number;
	name: string;
	icon: string;
	isOnLine: boolean;
};

type FriendListProps = {
	friends: FriendProps[];
};

function FriendList({friends}: FriendListProps) {
	return (
		<div className="card md:bg-transparent md:w-[80%] border border-card-border-2">
			<div className="flex justify-between mb-3">
				<div className="flex gap-1">
					<div className="font-bold"> My friends </div>
					<span> ({friends.length}) </span>
				</div>
			</div>
			<div className="flex flex-col gap-5 max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-0">
				{friends.map((f) => (
					<div className={`flex items-center text-left gap-4
					`}
					key={f.id}>
						<div className="text-3xl"> {f.icon} </div>
						<div className="flex flex-col text-left">
							<div className="text-sm font-semibold hoverable hover:font-bold">{f.name}</div>
							<div className="flex items-center gap-1.5 text-xs text-text-dim">
								 <span
								 	className={`w-2 h-2 rounded-full
										${f.isOnLine ? "bg-victory" : "bg-text-dim"}`}
								/>
								{f.isOnLine ? "Online" : "Offline"}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default FriendList;
