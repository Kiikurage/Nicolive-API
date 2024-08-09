import { EventEmitter } from "../EventEmitter";
import type { Websocket } from "../Websocket";
import type { PlatformAPI } from "./PlatformAPI";

async function extractWSAPIURLFromHTML(liveHTML: string) {
	const document = new DOMParser().parseFromString(liveHTML, "text/html");
	const propsJson = document.getElementById("embedded-data")?.dataset.props;
	if (propsJson === undefined) {
		throw new Error("Failed to extract WSAPI url");
	}

	const props = JSON.parse(propsJson);

	return props.site.relive.webSocketUrl;
}

class BrowserWebsocket
	extends EventEmitter<{
		error: [err: Error];
		open: [];
		close: [];
		message: [data: string];
	}>
	implements Websocket
{
	private readonly ws: WebSocket;

	constructor(url: string) {
		super();
		this.ws = new WebSocket(url);
		this.ws.addEventListener("error", (ev) =>
			this.emit(
				"error",
				new (class extends Error {
					constructor() {
						super("Error happened in WebSocket");
					}
					errorEvent = ev;
				})(),
			),
		);
		this.ws.addEventListener("open", () => this.emit("open"));
		this.ws.addEventListener("close", () => this.emit("close"));
		this.ws.addEventListener("message", (ev) => {
			this.emit("message", ev.data.toString());
		});
	}

	send(data: string): void {
		this.ws.send(data);
	}

	close(): void {
		this.ws.close();
	}
}

function createWebsocket(url: string): Websocket {
	return new BrowserWebsocket(url);
}

export const BrowserPlatformAPI: PlatformAPI = {
	extractWSAPIURLFromHTML,
	createWebsocket,
};
