import AuthLayout from "@/components/AuthLayout/AuthLayout";
import FormField from "@/components/FormField/FormField";
import UserIcon from "@/assets/icons/user.svg";
import PassIcon from "@/assets/icons/lock.svg";
import { toast } from "@/components/ui/toast";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/context/useAuth.ts";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { firstPasswordError } from "@/lib/passwordPolicy";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterForm = {
	email: string;
	username: string;
	password: string;
	confirmPassword: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const initialForm: RegisterForm = {
	email: "",
	username: "",
	password: "",
	confirmPassword: "",
};

function Register() {
	const [form, setForm] = useState<RegisterForm>(initialForm);
	const [errors, setErrors] = useState<RegisterErrors>({});
	//for auth
	const { register } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const { t } = useTranslation();

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	function validate(): RegisterErrors {
		const nextErrors: RegisterErrors = {};

		if (!form.email.trim()) {
			nextErrors.email = t("auth.errors.emailRequired");
		} else if (!EMAIL_REGEX.test(form.email)) {
			nextErrors.email = t("auth.errors.emailInvalid");
		}

		if (!form.username.trim()) {
			nextErrors.username = t("auth.errors.usernameRequired");
		} else if (form.username.trim().length < 3) {
			nextErrors.username = t("auth.errors.usernameTooShort");
		} else if (form.username.trim().length > 12) {
			nextErrors.username = t("auth.errors.usernameTooLong");
		}

		const passwordError = firstPasswordError(form.password);
		if (!form.password) {
			nextErrors.password = t("auth.errors.passwordRequired");
		} else if (passwordError) {
			nextErrors.password = t(passwordError);
		}

		if (form.confirmPassword !== form.password) {
			nextErrors.confirmPassword = t("auth.errors.passwordMismatch");
		}

		return nextErrors;
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const nextErrors = validate();
		setErrors(nextErrors);

		if (Object.keys(nextErrors).length > 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await register(form.email, form.password, form.username);
			toast.add({
			  type: "success",
			  title: t("auth.register.successTitle"),
			  description: t("auth.register.successDescription"),
			})
			void navigate("/home");
		} catch (err) {
			toast.add({
				type: "error",
				title: t("auth.register.failed"),
				description: err instanceof Error ? err.message : t("common.somethingWentWrong") //for compilo but its not hapy
			})
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<AuthLayout
			subtitle={t("auth.register.subtitle")}
			icon="🥷"
			heading={t("auth.register.heading")}
			description={t("auth.register.description")}
			onSubmit={(e) => { void handleSubmit(e); }}
  			submitLabel={isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
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
				id="email"
				label={t("auth.email")}
				iconSrc={UserIcon}
				type="email"
				placeholder="example@hello.com"
				value={form.email}
				onChange={handleChange}
				error={errors.email}
			/>

			<FormField
				id="username"
				label={t("auth.username")}
				iconSrc={UserIcon}
				type="text"
				placeholder="CoolAgent67"
				value={form.username}
				onChange={handleChange}
				error={errors.username}
			/>

			<FormField
				id="password"
				label={t("auth.password")}
				iconSrc={PassIcon}
				type="password"
				placeholder="Coolpassword31#"
				value={form.password}
				onChange={handleChange}
				error={errors.password}
			/>

			<FormField
				id="confirmPassword"
				label={t("auth.confirmPassword")}
				iconSrc={PassIcon}
				type="password"
				placeholder="Coolpassword31#"
				value={form.confirmPassword}
				onChange={handleChange}
				error={errors.confirmPassword}
			/>
		</AuthLayout>
	);
}

export default Register;
