import { Room, Client } from "@colyseus/core";
import { PlayerState, Player } from "./RoomState";
 
interface Payload {
    x: number;
    y: number;
}

export class Rooms extends Room {
    maxClients = 4;
    state = new PlayerState();
 
    messages = {
        doSomething: (client: Client, payload: Payload) => {
            // handle client's "doSomething" message
            console.log('client: ', client);
            console.log('payload: ', payload);
        }
    }

    // Called when the room is created
    onCreate(options: any) { }

    // Called when a client joins the room
    onJoin(client: Client, options: any) {
        this.state.players.set(client.sessionId, new Player());
    }

    // Called when a client leaves the room
    onLeave(client: Client, options: any) {
        this.state.players.delete(client.sessionId);
    }

    // Called when the room is disposed
    onDispose() { }
}