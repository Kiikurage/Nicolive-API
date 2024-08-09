import { fromBinary } from "@bufbuild/protobuf";
import type { DescMessage } from "@bufbuild/protobuf/dist/cjs/descriptors";
import type { MessageShape } from "@bufbuild/protobuf/dist/cjs/types";

export interface ReadableStream<T> {
	getReader(): ReadableStreamReader<T>;
}

export interface ReadableStreamReader<T> {
	read(): Promise<{
		done: boolean;
		value: T;
	}>;
}

export async function* decodeChunkStream<T extends DescMessage>(
	schema: T,
	readable: ReadableStream<Uint8Array>,
): AsyncGenerator<MessageShape<T>> {
	const decoder = new ChunkDecoder(schema);

	const reader = readable.getReader();

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}

		decoder.push(value);
		for (const chunk of decoder.read()) {
			yield chunk;
		}
	}
}

export function decodeChunks<T extends DescMessage>(
	schema: T,
	buffer: Uint8Array,
) {
	const decoder = new ChunkDecoder(schema);
	decoder.push(buffer);

	return decoder.read();
}

export class ChunkDecoder<T extends DescMessage> {
	private readonly schema: T;
	private buffer: Uint8Array = new Uint8Array();
	private cursor = 0;

	constructor(schema: T) {
		this.schema = schema;
	}

	read(): MessageShape<T>[] {
		const chunks: MessageShape<T>[] = [];

		outer: while (this.cursor < this.buffer.length) {
			let chunkBodySize = 0;
			const chunkHeaderStart = this.cursor;

			let flagContinueHeader = false;
			do {
				if (this.cursor >= this.buffer.length) {
					this.cursor = chunkHeaderStart;
					break outer;
				}
				const byte = this.buffer[this.cursor];
				flagContinueHeader = Boolean(byte & 0b10000000);
				chunkBodySize |=
					(byte & 0b01111111) << ((this.cursor - chunkHeaderStart) * 7);

				this.cursor += 1;
			} while (flagContinueHeader);

			const chunkBodyStart = this.cursor;
			const chunkBodyEnd = chunkBodyStart + chunkBodySize;

			if (chunkBodyEnd > this.buffer.length) {
				this.cursor = chunkHeaderStart;
				break;
			}

			chunks.push(
				fromBinary(
					this.schema,
					this.buffer.slice(chunkBodyStart, chunkBodyEnd),
				),
			);

			this.cursor = chunkBodyEnd;
		}

		return chunks;
	}

	push(buffer: Uint8Array): void {
		const newBuffer = new Uint8Array(this.buffer.length + buffer.length);
		newBuffer.set(this.buffer, 0);
		newBuffer.set(buffer, this.buffer.length);
		this.buffer = newBuffer;
	}
}
