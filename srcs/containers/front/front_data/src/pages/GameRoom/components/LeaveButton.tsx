import { useNavigate } from "react-router-dom";

function LeaveButton() {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate("/home")}
			className="badge badge-action hoverable shrink-0"
		>
			leave
		</button>
	);
}

export default LeaveButton;
