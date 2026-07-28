import victoryIcon from "../../../../assets/icons/victory-svgrepo-com.svg"
import maskIcon from "../../../../assets/icons/masks-svgrepo-com.svg"
import friendIcon from "../../../../assets/icons/friend-svgrepo-com.svg"

const features = [
	{ icon: victoryIcon, title: "Stratégie", description: "Usez de ruse et d'observation pour gagner" },
	{ icon: maskIcon, title: "Suspense", description: "Qui est l'imposteur ? À vous de la découvrir" },
	{ icon: friendIcon, title: "Amis", description: "Invitez vos amis et amusez-vous ensemble" },
];

function FeatureHighlights() {
	return (
		<div className="card w-full hidden md:grid md:grid-cols-3 md:gap-[clamp(15px,2vw,30px)]
            md:border-l-2 md:border-card-accent-border
            md:mt-[clamp(15px,2vw,30px)]">
			{features.map((feature) => (
					<div  key={feature.title} className="flex items-center gap-3">
						<div className="circle-purple w-14 h-14">
							<div className="mask-icon w-10.5 h-10.5 bg-accent-purple"
								style={{
									WebkitMaskImage: `url("${feature.icon}")`,
									maskImage: `url("${feature.icon}")` }}
							/>
						</div>
						<div className="text-left">
							<h3 className="mb-1 text-gray-high font-bold">
								{feature.title}
							</h3>
							<p className="text-gray-low text-xs">
								{feature.description}
							</p>
						</div>
					</div>
			))}
		</div>
	);
}

export default FeatureHighlights;
