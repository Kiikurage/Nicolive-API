import { EventEmitter } from "./EventEmitter";
import { MessageServerClient } from "./MessageServerClient";
import { WSAPIClient } from "./WSAPIClient";
import type { PlatformAPI } from "./platform/PlatformAPI";
import type * as proto from "./proto";

export interface NicoliveClientConfig {
	/**
	 *  配信ID(`"lvXXXXXXXX"`)
	 */
	liveId: string;
}

export namespace NicoliveClientConfig {
	export const Default: Required<NicoliveClientConfig> = {
		liveId: "",
	};
}

type EventMap = {
	message: [message: proto.NicoliveMessage, meta?: proto.ChunkedMessage_Meta];
	changeState: [message: proto.NicoliveState, meta?: proto.ChunkedMessage_Meta];

	chat: [message: proto.Chat, meta?: proto.ChunkedMessage_Meta];
	simpleNotification: [
		message: proto.SimpleNotification,
		meta?: proto.ChunkedMessage_Meta,
	];
	gift: [message: proto.Gift, meta?: proto.ChunkedMessage_Meta];
	nicoad: [message: proto.Nicoad, meta?: proto.ChunkedMessage_Meta];
	gameUpdate: [message: proto.GameUpdate, meta?: proto.ChunkedMessage_Meta];
	tagUpdated: [message: proto.TagUpdated, meta?: proto.ChunkedMessage_Meta];
	moderatorUpdated: [
		message: proto.ModeratorUpdated,
		meta?: proto.ChunkedMessage_Meta,
	];
	ssngUpdated: [message: proto.SSNGUpdated, meta?: proto.ChunkedMessage_Meta];
	overflowedChat: [message: proto.Chat, meta?: proto.ChunkedMessage_Meta];
};

/**
 * エントリポイントとなるクラス。配信の情報取得やコメントの取得などのAPIを提供する。
 */
export class NicoliveClientCore extends EventEmitter<EventMap> {
	private readonly config = NicoliveClientConfig.Default;
	private wsApiClient: WSAPIClient | null = null;
	private messageServerUri: string | null = null;
	private messageServerClient: MessageServerClient | null = null;

	/**
	 * NicoLiveClientのインスタンスを生成する
	 * @param config
	 * @param config.liveId 配信ID(`"lvXXXXXXXX"`)
	 * @param platformAPI PlatformAPIのインスタンス
	 */
	constructor(
		config: NicoliveClientConfig,
		private platformAPI: PlatformAPI,
	) {
		super();
		this.config = Object.assign({}, NicoliveClientConfig.Default, config);
	}

	/**
	 * 配信のWebSocketAPI及びコメントサーバーへ接続する
	 */
	connect() {
		this.disconnect();

		const wsApiClient = new WSAPIClient(this.config.liveId, this.platformAPI);
		wsApiClient.onMessageServerMessage = (message) => {
			this.setMessageServerUri(message.data.viewUri);
		};
		wsApiClient.connect();
		this.wsApiClient = wsApiClient;
	}

	/**
	 * 配信のWebSocketAPI及びコメントサーバーとの接続を切断する
	 */
	disconnect() {
		this.disconnectFromMessageServer();
		if (this.wsApiClient) {
			this.wsApiClient.disconnect();
		}
	}

	private setMessageServerUri(uri: string) {
		this.messageServerUri = uri;
		this.connectToMessageServer();
	}

	private connectToMessageServer() {
		this.disconnectFromMessageServer();

		const messageServerUri = this.messageServerUri;
		if (messageServerUri === null) {
			throw new Error("messageServerUri is not set");
		}

		const messageServerClient = new MessageServerClient(messageServerUri);

		messageServerClient.onChunkedMessage = (message) => {
			switch (message.payload.case) {
				case "message": {
					this.onNicoliveMessage(message.payload.value, message.meta);
					break;
				}

				case "state": {
					this.emit("changeState", message.payload.value, message.meta);
					break;
				}

				case "signal": {
					break;
				}
			}
		};

		messageServerClient.connect();
	}

	private onNicoliveMessage(
		message: proto.NicoliveMessage,
		meta?: proto.ChunkedMessage_Meta,
	) {
		this.emit("message", message, meta);

		switch (message.data.case) {
			case "chat":
				this.emit("chat", message.data.value, meta);
				break;

			case "simpleNotification":
				this.emit("simpleNotification", message.data.value, meta);
				break;

			case "gift":
				this.emit("gift", message.data.value, meta);
				break;

			case "nicoad":
				this.emit("nicoad", message.data.value, meta);
				break;

			case "gameUpdate":
				this.emit("gameUpdate", message.data.value, meta);
				break;

			case "tagUpdated":
				this.emit("tagUpdated", message.data.value, meta);
				break;

			case "moderatorUpdated":
				this.emit("moderatorUpdated", message.data.value, meta);
				break;

			case "ssngUpdated":
				this.emit("ssngUpdated", message.data.value, meta);
				break;

			case "overflowedChat":
				this.emit("overflowedChat", message.data.value, meta);
				break;
		}
	}

	private disconnectFromMessageServer() {
		if (this.messageServerClient) {
			this.messageServerClient.disconnect();
			this.messageServerClient = null;
		}
	}
}
