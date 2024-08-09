import type { IEventEmitter } from "./EventEmitter";

export interface Websocket
	extends IEventEmitter<{
		error: [err: Error];
		open: [];
		close: [];
		message: [data: string];
	}> {
	send(data: string): void;
	close(): void;
}
