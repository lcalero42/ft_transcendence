import type { LegalSection } from "@/components/LegalLayout/LegalLayout";

export const LAST_UPDATED = "2026-10-26";

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
			"Google or Discord login: if you sign in with Google or Discord, we receive your account ID, your name, your email address (only if the provider has verified it) and your profile picture. We use the name to create your username and save a copy of the picture as your avatar. We never receive your Google or Discord password.",
			"Guest accounts: if you play as a guest, we only store the username you choose. No email or password is asked.",
			"Profile: the bio and the avatar image you choose to add, and the date your account was created. Uploaded avatars are resized and converted, which removes hidden metadata such as location.",
			"Friends: the friend requests you send and receive, and their status (pending, accepted, declined or blocked).",
			"Games: the rooms you create, the games you play, the role you had, when you were eliminated and who won.",
			"Chat: messages sent in a room are only kept in the server's memory while the room is open. They are never saved in our database and disappear when the room closes.",
			"Technical data: your IP address is used, in memory only, to limit the number of requests sent to the server. Our web server and back-end also write technical logs, which may include your IP address, to help us fix bugs and keep the site secure.",
		],
	},
	{
		title: "Cookies and browser storage",
		paragraphs: [
			"We do not use analytics, ads or any tracking tool. The only cookie we use is needed to keep you logged in:",
		],
		items: [
			"access_token cookie: your login token. It cannot be read by JavaScript and is only sent over HTTPS. By default it is deleted when you close your browser and the token expires after 1 day. If you tick \"Remember me\" or log in with Google or Discord, it is kept for 30 days. Logging out deletes it and invalidates the token.",
			"Local storage: your browser remembers the language you chose.",
			"Session storage: when you are in a game, your browser keeps a reconnection token so you can come back if you lose connection. It is removed when you close the tab.",
		],
	},
	{
		title: "Third-party services",
		paragraphs: [
			"We do not sell your data and we do not share it with anyone for advertising. A few outside services are still involved:",
		],
		items: [
			"Google and Discord, only if you choose to log in with them. They will know that you used their account to sign in to Undercover.",
			"Google Fonts: our text font is loaded from Google's servers, so your browser sends your IP address to Google when the page loads.",
		],
	},
	{
		title: "Why we use your data",
		paragraphs: ["We use your data only to:"],
		items: [
			"Create your account and log you in.",
			"Show your profile, your friends and your game statistics.",
			"Run games and let you play and chat with other players in real time.",
			"Keep the website secure, for example by limiting repeated login attempts and too many requests.",
		],
	},
	{
		title: "Who can see your data",
		paragraphs: [
			"Other logged-in players can see your username, avatar, bio, account creation date and game history and statistics. Players in the same room as you also see your username, avatar and chat messages. Guest profiles are not public.",
			"Your email address and password are never shown to other players. Site administrators (members of our team) can see the list of accounts, including email addresses, to manage the website. Everything is hosted on our own server.",
		],
	},
	{
		title: "How long we keep your data",
		paragraphs: [
			"We keep your data as long as your account exists.",
			"Guest accounts are automatically closed 24 hours after they are created: the username is replaced by an anonymous one and the account can no longer be used.",
			"There is no button to delete your account yet. To have your account deleted, contact us (see below). We will close it and permanently erase your personal data (email, username, bio, avatar and friends) within 30 days. Your past games are then kept in anonymous form so other players' statistics stay correct.",
		],
	},
	{
		title: "Your rights",
		paragraphs: [
			"You can edit your bio and avatar yourself at any time on your profile. For anything else, contact us and our team will handle your request by hand. You can ask us to:",
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
