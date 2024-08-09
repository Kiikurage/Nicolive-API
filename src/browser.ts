import {
	type NicoliveClientConfig,
	NicoliveClientCore,
} from "./NicoliveClientCore";
import { BrowserPlatformAPI } from "./platform/BrowserPlatformAPI";

/**
 * エントリポイントとなるクラス。配信の情報取得やコメントの取得などのAPIを提供する。
 */
export class NicoliveClient extends NicoliveClientCore {
	/**
	 * NicoLiveClientのインスタンスを生成する
	 * @param config 設定
	 */
	constructor(config: NicoliveClientConfig) {
		super(config, BrowserPlatformAPI);
	}
}
