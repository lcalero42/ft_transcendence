

type RoleProps = {
	role: string;
	icon: string;
};
function FavoriteRole({role, icon} : RoleProps) {
	return (
	<div className="card gap-0 py-3 border border-card-border-2
		md:bg-transparent md:border-none md:py-0 md:flex-row">
		<div className="flex pb-3 md:pb-0 justify-between">
			<div className="text-left font-bold self-center">
				Favorite role
				<span className="hidden md:inline"> :</span>
			</div>
		</div>
		<div className="flex items-center
		md:flex-row-reverse">
			<div className="circle-purple w-11 h-11">
				<div className="mask-icon w-8 h-8 bg-accent-purple"
					style={{
						WebkitMaskImage: `url("${icon}")`,
						maskImage: `url("${icon}")`,
					}}>  </div>
			</div>
			<div className=" px-10">{role}</div>
		</div>
	</div>
);
}
export default FavoriteRole
