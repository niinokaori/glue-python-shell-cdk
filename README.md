## 概要
Glue Python Shellのジョブを作成し、EventBridgeスケジューラーから実行する環境を構築するCDKです。

## 使い方
- scriptフォルダ配下に置かれた.pyファイルでGlue Python Shellでジョブを作成します。
- パラメータはconfigディレクトリ配下の.tsファイルに記載します。
    - 環境ごとにパラメータを分ける場合は`環境名/環境名.ts`ファイルを作成してください。
- 以下のコードでデプロイします。
```
cdk deploy --profile <プロファイル名> -c envcode=<環境名>
```

