import type { FormEvent, ReactNode } from "react";
import Logo from "../Logo/Logo";
import Credit from "../Credit/Credit";
import Divider from "../Divider/Divider";
import SocialLogin from "../SocialLogin/SocialLogin";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "react-i18next";

type AuthLayoutProps = {
	subtitle: string;
	icon: string;
	heading: string;
	description: string;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
	submitLabel: string;
	footer?: ReactNode;
	showSocialLogin?: boolean;
	children: ReactNode;
};

function AuthLayout({ subtitle, icon, heading, description, onSubmit, submitLabel, footer, showSocialLogin = true, children }: AuthLayoutProps) {
	const { t } = useTranslation();

	return (
		<div className="page">
			<header className="flex w-full items-center justify-between gap-3 px-8 py-3 shadow-sm text-outline sm:px-[10vw] md:py-5">
				<Logo />
				<LanguageSwitcher />
			</header>

			<main className="page-main flex flex-col items-center">

				<div className="card border-2 border-card-border w-full max-w-sm md:max-w-3xl md:border-0 md:bg-transparent md:rounded-none md:px-0 md:py-0">

					<h1 className="mb-3 md:text-center text-xl md:text-4xl font-semibold">
						{t("auth.welcome")} <span style={{color: "var(--color-accent-purple)"}}>Undercover</span>
					</h1>

					<h5 className="mb-3 md:text-center text-sm md:text-xl font-semibold" style={{color: "var(--color-gray-low)"}}>
						{subtitle}
					</h5>

					<form onSubmit={onSubmit} className="flex w-full flex-col gap-2 md:min-w-0 md:rounded-xl md:border-2 md:border-card-border md:bg-card md:px-5 md:py-4">

						<div className="mb-4 hidden items-center gap-3 md:flex">
							<span className="text-4xl">{icon}</span>
							<div className="text-left">
								<h3 className="text-gray-high font-bold">
									{heading}
								</h3>
								<p className="text-gray-low text-xs">
									{description}
								</p>
							</div>
						</div>

						{children}

						<button
							type="submit"
							className="mt-4 w-full cursor-pointer rounded-full bg-accent py-3 font-semibold text-white hover:bg-accent-hover"
						>
							{submitLabel}
						</button>

						{showSocialLogin && (
							<>
								<div className="mt-3">
									<Divider label={t("auth.orContinueWith")} />
								</div>

								<div className="mt-1">
									<SocialLogin />
								</div>
							</>
						)}

						{footer}
					</form>

				</div>

			</main>

			<Credit />

		</div>
	);
}

export default AuthLayout;
