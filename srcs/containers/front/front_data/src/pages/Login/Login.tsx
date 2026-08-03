import Logo from "../../components/Logo/Logo";
import Credit from "../../components/Credit/Credit";
import FormField from "../../components/FormField/FormField";
import Checkbox from "./components/Checkbox/Checkbox";
import Divider from "./components/Divider/Divider";
import SocialLogin from "./components/SocialLogin/SocialLogin";
import UserIcon from "../../assets/icons/user.svg";
import PassIcon from "../../assets/icons/lock.svg";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

function Login() {
	const [rememberMe, setRememberMe] = useState(false);

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		console.log("submit fired", { rememberMe });
	}

	return (
		<div className="page">
			<header className="flex w-full items-center justify-center md:justify-start px-[10vw] py-5 shadow-sm text-outline">
				<Logo />
			</header>

			<main className="page-main flex flex-col items-center">

				<div className="card border-2 border-card-border w-full max-w-sm md:max-w-3xl md:border-0 md:bg-transparent md:rounded-none md:px-0 md:py-0">

					<h1 className="mb-3 md:text-center text-xl md:text-4xl font-semibold">
						Bienvenue sur <span style={{color: "var(--color-accent-purple)"}}>Undercover</span>
					</h1>

					<h5 className="mb-3 md:text-center text-sm md:text-xl font-semibold" style={{color: "var(--color-gray-low)"}}>
						Connecte toi pour continuer ton aventure !
					</h5>

					<form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 md:min-w-0 md:rounded-xl md:border-2 md:border-card-border md:bg-card md:px-5 md:py-4">

						<div className="mb-4 hidden items-center gap-3 md:flex">
							<span className="text-4xl">🥷</span>
							<div className="text-left">
								<h3 className="text-gray-high font-bold">
									Connecte-toi à ton compte
								</h3>
								<p className="text-gray-low text-xs">
									Entre tes identifiants pour accéder à ton compte.
								</p>
							</div>
						</div>

						<FormField
							label="Email ou login"
							iconSrc={UserIcon}
							type="text"
							placeholder="Email ou login"
						/>

						<FormField
							label="Mot de passe"
							iconSrc={PassIcon}
							type="password"
							placeholder="Mot de passe"
						/>

						<div className="mt-2 ml-2">
							<Checkbox
								id="remember-me"
								label="Remember me"
								checked={rememberMe}
								onChange={setRememberMe}
							/>
						</div>

						<button
							type="submit"
							className="mt-4 w-full cursor-pointer rounded-full bg-accent py-3 font-semibold text-white hover:bg-accent-hover"
						>
							Se connecter
						</button>

						<div className="mt-3">
							<Divider label="Ou continuer avec" />
						</div>

						<div className="mt-1">
							<SocialLogin />
						</div>
					</form>

					<p className="mt-4 text-center text-sm text-gray-low">
						Pas encore de compte ?{" "}
						<Link to="/register" className="font-semibold text-accent-purple hover:underline">
							Crée-en un
						</Link>
					</p>

				</div>

			</main>

			<Credit />

		</div>
	);
}

export default Login;
