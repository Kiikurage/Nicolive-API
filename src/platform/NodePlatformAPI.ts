import * as cheerio from "cheerio";
import { WebSocket } from "ws";
import type { Websocket } from "../Websocket";
import type { PlatformAPI } from "./PlatformAPI";

async function extractWSAPIURLFromHTML(liveHTML: string) {
	const $ = cheerio.load(liveHTML);
	const propsJson = $("#embedded-data").attr("data-props") as string;

	const props = JSON.parse(propsJson);

	return props.site.relive.webSocketUrl;
}

function createWebsocket(url: string): Websocket {
	return new WebSocket(url);
}

export const NodePlatformAPI: PlatformAPI = {
	extractWSAPIURLFromHTML,
	createWebsocket,
};
