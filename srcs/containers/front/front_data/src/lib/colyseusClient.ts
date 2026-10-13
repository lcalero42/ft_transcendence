import { Client } from "@colyseus/sdk";
import type { colyseusServer } from "@back/colyseus/server";

export const client = new Client<typeof colyseusServer>(`wss://${window.location.host}/colyseus`);
