const LOGO = `
██╗   ██╗███╗   ██╗██████╗ ███████╗██████╗  ██████╗ ██████╗ ██╗   ██╗███████╗██████╗
██║   ██║████╗  ██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗
██║   ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝██║     ██║   ██║██║   ██║█████╗  ██████╔╝
██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
╚██████╔╝██║ ╚████║██████╔╝███████╗██║  ██║╚██████╗╚██████╔╝ ╚████╔╝ ███████╗██║  ██║
 ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝`;

export function printConsoleGreeting() {
	const styles = getComputedStyle(document.documentElement);
	const accent = styles.getPropertyValue("--color-game-accent");
	const soft = styles.getPropertyValue("--color-accent-purple");

	console.log(`%c${LOGO}`, `color: ${accent}; font-weight: bold;`);
	console.log(
		"%cLooking for the Undercover in the source? It's not here...",
		`color: ${soft}; font-size: 16px; font-weight: bold;`,
	);
	console.log(
		"%cHey 42 student! Since you're here, come play a round instead of reading our bundle.",
		`color: ${soft}; font-size: 13px;`,
	);
	console.log(
		"%cOnly the first letters matter… and the chat is listening.",
		`color: ${soft}; font-size: 13px;`,
	);
	console.log("%c╎ℸ̣ ∴ᔑᓭ ᔑꖎꖎ ᔑ ↸∷ᒷᔑᒲ", `color: ${accent}; font-size: 14px; font-style: italic;`);
}
