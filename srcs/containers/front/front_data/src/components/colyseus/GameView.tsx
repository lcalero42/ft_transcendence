import { useState } from "react";
import { useRoomState } from "@colyseus/react";
import type { Room } from "@colyseus/sdk";
import type { UndercoverRoom } from "@back/colyseus/rooms/UndercoverRoom";

type GameViewProps = {
	room: Room<UndercoverRoom>;
};

function GameView({ room }: GameViewProps) {
	const [chatInput, setChatInput] = useState("");
	const phase = useRoomState(room, (s) => s.phase);
	const hostSessionId = useRoomState(room, (s) => s.hostSessionId);
	const players = useRoomState(room, (s) => s.players);
	const participants = useRoomState(room, (s) => s.participants);
	const chat = useRoomState(room, (s) => s.chat);
	const minParticipants = useRoomState(room, (s) => s.minParticipants);
	const maxParticipants = useRoomState(room, (s) => s.maxParticipants);

	const isHost = room.sessionId === hostSessionId;
	const isParticipant = participants?.includes(room.sessionId) ?? false;
	const playerEntries = Object.entries(players ?? {});

	return (
		<div style={{ fontFamily: "monospace", padding: "1rem" }}>
			<h2>UndercoverRoom debug view</h2>
			<p>room: {room.roomId} | you: {room.sessionId} | phase: <b>{phase}</b></p>

			<h3>Players ({playerEntries.length})</h3>
			<ul>
				{playerEntries.map(([sessionId, player]) => (
					<li key={sessionId}>
						{player.name} {player.connected ? "🟢" : "🔴"}
						{sessionId === room.sessionId ? " (you)" : ""}
						{sessionId === hostSessionId ? " (host)" : ""}
					</li>
				))}
			</ul>

			<h3>
				Participants ({participants?.length ?? 0}/{maxParticipants}, need {minParticipants} to start)
			</h3>
			<ul>
				{(participants ?? []).map((sessionId) => (
					<li key={sessionId}>
						{players?.[sessionId]?.name ?? sessionId}
						{sessionId === room.sessionId ? " (you)" : ""}
					</li>
				))}
			</ul>

			<h3>Chat</h3>
			<ul>
				{(chat ?? []).map((message, i) => (
					<li key={i}>
						<b>{message.name}:</b> {message.text}
					</li>
				))}
			</ul>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!chatInput.trim()) return;
					room.send("chat", chatInput);
					setChatInput("");
				}}
			>
				<input value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
				<button type="submit">Send</button>
			</form>

			<h3>Controls</h3>
			<div style={{ display: "flex", gap: "0.5rem" }}>
				{phase === "setup" && isHost && (
					<button onClick={() => room.send("start")}>Start (open room)</button>
				)}
				{phase === "open" && !isParticipant && (
					<button onClick={() => room.send("joinGame")}>Join game</button>
				)}
				{phase === "open" && isParticipant && (
					<button onClick={() => room.send("leaveGame")}>Leave game</button>
				)}
				{phase === "open" && isHost && (participants?.length ?? 0) >= (minParticipants ?? 0) && (
					<button onClick={() => room.send("startGame")}>Start game</button>
				)}
				{phase === "playing" && isHost && (
					<button onClick={() => room.send("endGame")}>End game</button>
				)}
			</div>
		</div>
	);
}

export default GameView;