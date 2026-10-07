import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MobileDrawerProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
}

function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
	const { t } = useTranslation();

	useEffect(() => {
		if (!open) return;

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") onClose();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	return (
		<div
			className={`fixed inset-0 z-50 flex justify-end 2xl:hidden ${open ? "" : "pointer-events-none"}`}
			aria-hidden={!open}
		>
			<button
				type="button"
				aria-label={t("common.close")}
				onClick={onClose}
				className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
			/>
			<div
				className={`bg-bg-deep relative flex h-full w-full max-w-sm flex-col p-4 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
			>
				<button
					type="button"
					onClick={onClose}
					aria-label={t("common.close")}
					className="mb-3 self-end text-white"
				>
					<X className="size-6" />
				</button>
				<div className="min-h-0 flex-1">{children}</div>
			</div>
		</div>
	);
}

export default MobileDrawer;
