import { useNavigate } from "react-router-dom";

function LeaveButton() {
	const navigate = useNavigate();

	return (
		<button
			type="button"
			onClick={() => navigate("/home")}
			className="badge hoverable shrink-0 px-[max(1.2vw,14px)] py-[max(0.7vw,8px)] text-[max(0.8vw,13px)]"
		>
			leave
		</button>
	);
}

export default LeaveButton;
