import editIcon from "../../../../assets/icons/pencil.svg";


type EditIconProps = {
	color?: string;
};

type CSSPropertiesWithVars = React.CSSProperties & {
	"--icon-color"?: string;
};

function EditIcon({color="white"}: EditIconProps) {
	return (
		<span
			className="mask-icon w-6 h-6 hoverable bg-(--icon-color) hover:bg-white"
			style={{
				WebkitMaskImage: `url("${editIcon}")`,
				maskImage: `url("${editIcon}")`,
				"--icon-color": color,
			} as CSSPropertiesWithVars}
		/>
	);
}

export default EditIcon;
