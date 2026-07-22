import "./FeatureHighlights.css";
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
		<section className="feature-highlights">
			{features.map((feature) => (
					<div className="feature-item" key={feature.title}>
						<div className="icon-circle">
							<div className="feature-icon"
								style={{
									WebkitMaskImage: `url("${feature.icon}")`,
									maskImage: `url("${feature.icon}")` }}
							/>
						</div>
						<div className="feature-text">
							<h3>{feature.title}</h3>
							<p>{feature.description}</p>
						</div>
					</div>
			))}
		</section>
	);
}

export default FeatureHighlights;
