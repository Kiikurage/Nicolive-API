import type { Websocket } from "./Websocket";
import type { PlatformAPI } from "./platform/PlatformAPI";

export class WSAPIClient {
	private readonly liveId: string;
	private pingerId: number | null = null;
	private websocketClient: Websocket | null = null;

	constructor(
		liveId: string,
		private readonly platformAPI: PlatformAPI,
	) {
		this.liveId = liveId.replace(/^lv/, "");
	}

	public async connect() {
		if (this.websocketClient !== null) {
			this.disconnect();
		}

		const liveHTML = await (
			await fetch(`https://live.nicovideo.jp/watch/lv${this.liveId}`)
		).text();
		const websocketURL =
			await this.platformAPI.extractWSAPIURLFromHTML(liveHTML);

		const websocketClient = this.platformAPI
			.createWebsocket(websocketURL)
			.on("error", (err) => {
				throw err;
			})
			.on("open", () => {
				websocketClient.send(
					JSON.stringify({
						type: "startWatching",
						data: {
							stream: {
								quality: "high",
								protocol: "hls",
								latency: "low",
								chasePlay: false,
							},
							room: { protocol: "webSocket", commentable: false },
							reconnect: false,
						},
					}),
				);
			})
			.on("close", () => {
				throw new Error("[WSAPIClient] disconnected");
			})
			.on("message", this.onRawMessage);

		this.websocketClient = websocketClient;
	}

	public disconnect() {
		this.stopPinger();

		if (this.websocketClient === null) return;
		this.websocketClient.close();
		this.websocketClient = null;
	}

	private startPinger(interval: number) {
		this.pingerId = setInterval(() => {
			this.websocketClient?.send(JSON.stringify({ type: "keepSeat" }));
		}, interval * 1000) as unknown as number;
	}

	private stopPinger() {
		if (this.pingerId !== null) {
			clearInterval(this.pingerId);
			this.pingerId = null;
		}
	}

	private onRawMessage = (data: string) => {
		const message = JSON.parse(data) as WSAPIMessage;
		switch (message.type) {
			case "messageServer": {
				this.onMessageServerMessage(message);
				break;
			}
			case "seat": {
				this.startPinger(message.data.keepIntervalSec);
				break;
			}
			case "ping": {
				this.websocketClient?.send(JSON.stringify({ type: "pong" }));
				break;
			}
			default: {
				// ignored
			}
		}
	};

	public onMessageServerMessage = (message: WSAPIMessageServerMessage) => {};
}

type WSAPIMessage =
	| WSAPIMessageServerMessage
	| WSAPISeatMessage
	| WSAPIPingMessage;

interface WSAPIMessageServerMessage {
	type: "messageServer";
	data: {
		viewUri: string;
		vposBaseTime: string;
	};
}

interface WSAPISeatMessage {
	type: "seat";
	data: {
		keepIntervalSec: number;
	};
}

interface WSAPIPingMessage {
	type: "ping";
}
