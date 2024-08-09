import type { Websocket } from "../Websocket";

export interface PlatformAPI {
	extractWSAPIURLFromHTML(html: string): Promise<string>;
	createWebsocket(url: string): Websocket;
}
