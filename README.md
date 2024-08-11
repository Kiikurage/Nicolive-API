# NicoLive API

Web版ニコニコ生放送のJavaScriptから抽出したAPI定義。

> [!CAUTION] 
> このAPI定義は非公式であり、最新の実装と異なる可能性があります。

## 利用法

NicoLiveApiクラスをインポートして利用します。

```typescript
// Node.js環境
import { NicoliveClient } from '@kikurage/nicolive-api/node';

// ブラウザ環境
import { NicoliveClient } from '@kikurage/nicolive-api/browser';


// 利用例
new NicoliveClient({ liveId: __LIVE_ID__ })
    .on("chat", (chat) => {
        console.log(`[${chat.name}] ${chat.content}`);
    })
    .connect();
```

## API

### `NicoliveClient`

エントリポイントとなるクラス。配信の情報取得やコメントの取得などのAPIを提供する。

#### `new NicoliveClient(config: NicoliveClientConfig): NicoliveClient`

NicoliveClientのインスタンスを生成する。

##### 引数

- `config`: NicoliveClientの設定
  - `config.liveId`: (`string`) 配信ID(`"lvXXXXXXXX"`)


#### `NicoliveClient.connect(): void`

配信のWebSocketAPI及びコメントサーバーへ接続する。


#### `NicoliveClient.disconnect(): void`

配信のWebSocketAPI及びコメントサーバーとの接続を切断する。


#### `NicoliveClient.on(event: string, listener: (...args: any[]) => void): NicoliveClient`

イベントリスナーを登録する。

##### 引数

- `event`: (`string`) イベント名
- `listener`: (`(...args: any[]) => void`) イベントリスナー


#### `NicoliveClient.off(event: string, listener: (...args: any[]) => void): NicoliveClient`

イベントリスナーを解除する。

##### 引数

- `event`: (`string`) イベント名
- `listener`: (`(...args: any[]) => void`) イベントリスナー


#### `NicoliveClient.once(event: string, listener: (...args: any[]) => void): NicoliveClient`

一度だけ呼ばれるイベントリスナーを登録する。

##### 引数

- `event`: (`string`) イベント名
- `listener`: (`(...args: any[]) => void`) イベントリスナー


#### Event: `chat`

ユーザーチャットを受信した際に呼び出されるイベント。

##### 引数

- `chat`: (`Chat`) チャット
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `simpleNotification`

シンプル通知(配信動画下部に流れる無地の文言)を受信した際に呼び出されるイベント。

##### 引数

- `gift`: (`SimpleNotification`) シンプル通知
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `gift`

ギフト通知を受信した際に呼び出されるイベント。

##### 引数

- `gift`: (`Gift`) ギフト
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `nicoad`

ニコニ広告を受信した際に呼び出されるイベント。

##### 引数

- `nicoad`: (`Nicoad`) 広告
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `gameUpdate`

放送ネタが変化した際に呼び出されるイベント。

##### 引数

- `gameUpdate`: (`GameUpdate`) 更新内容
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `tagUpdated`

タグが変化した際に呼び出されるイベント。

##### 引数

- `gameUpdate`: (`TagUpdated`) 最新のタグ一覧
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `moderatorUpdated`

モデレータが追加・削除された際に呼び出されるイベント。

##### 引数

- `message`: (`ModeratorUpdated`) 更新内容
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `ssngUpdated`

NG設定が変更された際に呼び出されるイベント。

##### 引数

- `message`: (`SSNGUpdated`) 更新内容
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `message`

メッセージサーバから何らかのメッセージを受信した際に呼び出されるイベント。

##### 引数

- `message`: (`NicoliveMessage`) メッセージ
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


#### Event: `changeState`

メッセージサーバからchangeStateメッセージを受信した際に呼び出されるイベント。

##### 引数

- `message`: (`NicoliveState`) メッセージ
- `meta`: (`ChunkedMessage_Meta?`) メタ情報


