import "./EditIcon.css"
import editIcon from "../../../../assets/icons/pencil.svg";


type EditIconProps = {
	color?: string;
};

function EditIcon({color="white"}: EditIconProps) {
	return (
		<span
			className="edit-icon"
			style={{
				WebkitMaskImage: `url("${editIcon}")`,
				maskImage: `url("${editIcon}")`,
				backgroundColor: color,
			}}
		/>
	);
}

export default EditIcon;
