import { useNavigate } from "react-router-dom";

function LeaveButton() {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate("/home")}
			className="badge badge-action hoverable rounded-lg! shrink-0"
		>
			Leave
		</button>
	);
}

export default LeaveButton;
