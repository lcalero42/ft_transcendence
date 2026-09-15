import { useNavigate } from "react-router-dom";

function LeaveButton() {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate("/home")}
			className="badge hoverable shrink-0 px-5 py-2.5 text-base"
		>
			leave
		</button>
	);
}

export default LeaveButton;
