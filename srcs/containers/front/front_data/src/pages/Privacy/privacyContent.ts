import type { LegalSection } from "@/components/LegalLayout/LegalLayout";

export const LAST_UPDATED = "2026-09-28";

export const privacySections: LegalSection[] = [
	{
		title: "Who we are",
		paragraphs: [
			"Undercover is a student project made at 42 by alarroye, ekeisler, lcalero and thmaitre. We are responsible for the data collected on this website.",
		],
	},
	{
		title: "What data we collect",
		paragraphs: ["We only collect what the game needs to work:"],
		items: [
			"Account: your username, your email address and your password. Your password is hashed with bcrypt, so we never store or see it in plain text.",
			"Profile: the bio and the avatar image you choose to add, and the date your account was created.",
			"Friends: the friend requests you send and receive, and their status (pending, accepted, declined or blocked).",
			"Games: the rooms you create, the games you play, the role you had, when you were eliminated and who won.",
			"Chat: messages sent in a room are only kept in the server's memory while the room is open. They are never saved and disappear when the room closes.",
			"Technical data: your IP address is used for a short time, in memory only, to limit repeated login and sign-up attempts. The server also writes technical logs to help us fix bugs.",
		],
	},
	{
		title: "Cookies and browser storage",
		paragraphs: [
			"We do not use cookies, analytics, ads or any tracking tool.",
			"To keep you logged in, your browser stores a login token in its local storage. This token expires after 1 day. When you are in a game, your browser also stores a reconnection token in its session storage, which is removed when you close the tab. Logging out removes the login token.",
		],
	},
	{
		title: "Why we use your data",
		paragraphs: ["We use your data only to:"],
		items: [
			"Create your account and log you in.",
			"Show your profile, your friends and your game statistics.",
			"Run games and let you play with other players in real time.",
			"Keep the website secure, for example by limiting repeated login attempts.",
		],
	},
	{
		title: "Who can see your data",
		paragraphs: [
			"Other logged-in players can see your username, avatar, bio and game statistics. Your email address and password are never shown to other players.",
			"Only the four members of our team can access the database. Everything is hosted on our own server. We do not sell your data and we do not share it with any third party.",
		],
	},
	{
		title: "How long we keep your data",
		paragraphs: [
			"We keep your data as long as your account exists.",
			"When you delete your account, it is deactivated immediately and no longer visible to other players, but the data stays in our database. To have all your personal data permanently erased, contact us (see below) and we will do it within 30 days. Your past games are then kept in anonymous form so other players' statistics stay correct.",
		],
	},
	{
		title: "Your rights",
		paragraphs: [
			"You can edit your profile yourself at any time. For anything else, contact us and our team will handle your request by hand. You can ask us to:",
		],
		items: [
			"Tell you what personal data we hold about you.",
			"Send you a copy of your data.",
			"Correct your data.",
			"Permanently erase your data.",
		],
	},
	{
		title: "Contact",
		paragraphs: [
			"To make a request or ask a question about your data, send a message to one of us on the 42 Lyon Discord server. We will answer within 30 days.",
		],
		items: ["alarroye", "ekeisler", "lcalero", "thmaitre"],
	},
	{
		title: "Changes to this policy",
		paragraphs: [
			"If we change what data we collect or how we use it, we will update this page and the date at the top.",
		],
	},
];
