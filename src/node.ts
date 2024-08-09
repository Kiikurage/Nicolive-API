import {
	type NicoliveClientConfig,
	NicoliveClientCore,
} from "./NicoliveClientCore";
import { NodePlatformAPI } from "./platform/NodePlatformAPI";

/**
 * エントリポイントとなるクラス。配信の情報取得やコメントの取得などのAPIを提供する。
 */
export class NicoliveClient extends NicoliveClientCore {
	/**
	 * NicoLiveClientのインスタンスを生成する
	 * @param config 設定
	 */
	constructor(config: NicoliveClientConfig) {
		super(config, NodePlatformAPI);
	}
}
