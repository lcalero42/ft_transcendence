import AuthLayout from "../../components/AuthLayout/AuthLayout";
import FormField from "../../components/FormField/FormField";
import UserIcon from "../../assets/icons/user.svg";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTranslation } from "react-i18next";

const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 24;

function Guest() {
	const { guest, isAuth } = useAuth();
	const { t } = useTranslation();
	const location = useLocation();
	const from = (location.state as { from?: string } | null)?.from ?? "/home";

	const [name, setName] = useState("");
	const [nameError, setNameError] = useState<string | undefined>();
	const [authError, setAuthError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isAuth) {
		return <Navigate to={from} replace />;
	}

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setName(e.target.value);
	}

	function validate(): string | undefined {
		const trimmed = name.trim();
		if (!trimmed) return t("auth.errors.usernameRequired");
		if (trimmed.length < NAME_MIN_LENGTH) return t("auth.errors.usernameTooShort");
		if (trimmed.length > NAME_MAX_LENGTH) return t("auth.errors.usernameTooLong");
		return undefined;
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setAuthError(null);

		const error = validate();
		setNameError(error);
		if (error) return;

		setIsSubmitting(true);
		try {
			await guest(name.trim());
		} catch (err) {
			setAuthError(err instanceof Error ? err.message : t("auth.guestLogin.failed"));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<AuthLayout
			subtitle={t("auth.guestLogin.subtitle")}
			icon="🕵️"
			heading={t("auth.guestLogin.heading")}
			description={t("auth.guestLogin.description")}
			onSubmit={(e) => { void handleSubmit(e); }}
			submitLabel={isSubmitting ? t("auth.guestLogin.submitting") : t("auth.guestLogin.submit")}
			showSocialLogin={false}
			footer={
				<p className="mt-4 text-center text-sm text-gray-low">
					{t("auth.register.hasAccount")}{" "}
					<Link to="/login" className="font-semibold text-accent-purple hover:underline">
						{t("auth.register.logIn")}
					</Link>
				</p>
			}
		>
			<FormField
				id="name"
				label={t("auth.username")}
				iconSrc={UserIcon}
				type="text"
				placeholder="SneakyFox"
				value={name}
				onChange={handleChange}
				error={nameError}
			/>
			{authError && (
				<p className="mt-2 text-center text-sm" style={{color:"var(--color-defeat)"}}>
					{authError}
				</p>
			)}
		</AuthLayout>
	);
}

export default Guest;
