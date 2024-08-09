import { type ReadableStream, decodeChunkStream } from "./ChunkStream";
import type {
	BackwardSegment,
	ChunkedEntry_ReadyForNext,
	MessageSegment,
} from "./proto";
import * as proto from "./proto";

export class MessageServerClient {
	private nextStreamAt: bigint | "now" = "now";
	private abortController: AbortController | null = null;

	constructor(private readonly messageServerUrl: string) {}

	public connect() {
		this.disconnect();
		this.fetchChunkedEntryStreamByPolling();
	}

	public disconnect() {
		this.abortController?.abort();
		this.abortController = null;
	}

	public onChunkedMessage = (message: proto.ChunkedMessage) => {};

	private getOrCreateAbortController() {
		if (this.abortController === null) {
			this.abortController = new AbortController();
		}
		return this.abortController;
	}

	private async fetchChunkedEntryStreamByPolling() {
		while (!this.abortController?.signal?.aborted) {
			try {
				const abortController = this.getOrCreateAbortController();

				const response = await fetch(
					`${this.messageServerUrl}?at=${this.nextStreamAt}`,
					{
						signal: abortController.signal,
						headers: {
							Priority: "u=1, i",
						},
					},
				);

				for await (const chunk of decodeChunkStream(
					proto.ChunkedEntrySchema,
					response.body as ReadableStream<Uint8Array>,
				)) {
					const entry = chunk.entry;
					switch (entry.case) {
						case "backward":
							this.onBackwardChunkedEntry(entry.value);
							break;

						case "segment":
							this.onSegmentChunkedEntry(entry.value);
							break;

						case "previous":
							this.onPreviousChunkedEntry(entry.value);
							break;

						case "next":
							this.onNextChunkedEntry(entry.value);
							break;
					}
				}
			} catch (ignored) {}
		}
	}

	private onBackwardChunkedEntry = async (chunk: BackwardSegment) => {
		// const snapshotUri = chunk.snapshot?.uri;
		// if (snapshotUri !== undefined) {
		// 	// TODO: 謎
		// }
		//
		// const segmentUri = chunk.segment?.uri;
		// if (segmentUri !== undefined) {
		// 	console.log(await getPackedSegment(segmentUri));
		// }
	};

	private onSegmentChunkedEntry = async (chunk: MessageSegment) => {
		const response = await fetch(chunk.uri);
		for await (const message of decodeChunkStream(
			proto.ChunkedMessageSchema,
			response.body as ReadableStream<Uint8Array>,
		)) {
			this.onChunkedMessage(message);
		}
	};

	private onPreviousChunkedEntry = async (chunk: MessageSegment) => {
		// 不明: 前回のStreamにて"segment"として配信済みのチャンクが"previous"として届いている?
		// const response = await axios.get(chunk.uri, {
		// 	responseType: "arraybuffer",
		// });
		//
		// const messages = decodeChunks(proto.ChunkedMessageSchema, response.data);
		// for (const message of messages) {
		// 	console.log(
		// 		JSON.stringify(toJson(proto.ChunkedMessageSchema, message), null, 2),
		// 	);
		// }
	};

	private onNextChunkedEntry = (chunk: ChunkedEntry_ReadyForNext) => {
		this.nextStreamAt = chunk.at;
	};
}
