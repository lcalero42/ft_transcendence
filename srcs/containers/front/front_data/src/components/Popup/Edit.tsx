import { useState,useCallback, useEffect } from "react";

type EditProps = {
	onClose: () => void;
	children: (handleClose: () => void) => React.ReactNode;
}
function Edit({onClose, children}: EditProps) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);

	 const handleClose = useCallback(() => {
    	setIsVisible(false);
    	setTimeout(onClose, 200);
  	}, [onClose]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				handleClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleClose]);


	return (
		<div className={`fixed inset-0 z-101 flex flex-col items-center justify-center bg-black/50
		hoverable transition-opacity ${isVisible ? "opacity-100" : "opacity-0"}`}
		onClick={handleClose}>
			<div className={`card bg-card/80 border border-card-border-2 items-center`}
			onClick={(e) => e.stopPropagation()}>
				{children(handleClose)}
			</div>
		</div>
	);
}

export default Edit;
