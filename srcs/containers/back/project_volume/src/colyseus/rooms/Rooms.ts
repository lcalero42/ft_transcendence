import { Room, Client } from "@colyseus/core";
import { RoomState, Player } from "./RoomState";

export interface Payload {
    x: number;
    y: number;
    name: string;
}

export class Rooms extends Room {
    maxClients = 4;
    state = new RoomState();
 
    messages = {
        doSomething: (client: Client, payload: Payload) => {
            // handle client's "doSomething" message
            console.log('client: ', client);
            console.log('payload: ', payload);
        },
        do: (client: Client, payload: Payload) => {
            console.log(client.sessionId, "sent 'action' message: ", payload);
        }
    }

    // Called when the room is created
    onCreate(options: any) { 
        console.log('room created');
    }

    // Called when a client joins the room
    onJoin(client: Client, options: any) {
        console.log('room joined');
        // this.state.players.set(client.sessionId, new Player());
        client.send("welcome", "Welcome to the room!");

    }

    // Called when a client leaves the room
    onLeave(client: Client, options: any) {
        console.log('room leaved');
        this.state.players.delete(client.sessionId);
    }

    // Called when the room is disposed
    onDispose() { 
        console.log('room disposed');
        console.log('------------------------------');
    }
}