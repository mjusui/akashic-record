# AKASHIc Record

AKASHIのAPIを使って、従業員ごとの労働日、工数入力、それぞれの入力間違い(未入力含む)の数をCSVで出力するChrome拡張です。

# インストール方法

1. [最新(Latest)のリリース](https://github.com/mjusui/akashic-record/releases)のzipファイルをダウンロードして、適当なフォルダーに展開します
1. [Chrome拡張のドキュメント - パッケージ化されていない拡張機能を読み込む](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world?hl=ja#load-unpacked) の手順にしたがってインストールしてください

# 使い方


## 初期設定

1. Chrome拡張のアイコンをクリックすると、サイドパネルが開きます。
1. 「AKASHI設定」のフォームを入力します。一度入力したフォームは保存されます。

### フォームの説明

名前 | 説明
--- | ---
AKASHI URL | あなたの使っているAKASHIのURL。AKASHIの仕様で、企業によって使われているURLがいくつかに分かれているようです。
API token | AKASHIのマイページであなたが発行したAPIトークン。APIトークンを発行するには、AKASHIの管理者に発行許可の設定をしてもらう必要があります。
Your Cooperation ID | AKASHIにログインするときに入力する企業のID。
Start Date | 集計する期間の開始日。YYYYmmdd形式。
End Date | 集計する期間の終了日。YYYYmmdd形式。

## 結果の取得

1. 「CSV作成」をクリックすると、データがテキストエリアに出力されます。

### 例

```example.csv
ID,氏名,労働日,労働日エラー,工数入力,工数入力エラー
114948,城石 真伍,9,5,4,6
...
```
### 列の説明

列の名前 | 説明
---|---
ID | 従業員のID。
氏名 | 従業員の氏名。
労働日 | 休日でない日、もしくは勤怠入力のある休日の合計。
労働日エラー | 労働日のうち、勤怠入力が間違っている日(開始と終了のどちらか、もしくは両方がない、など)。
工数入力 | 工数が入力されている日。
工数入力エラー | 工数入力が間違っている日(労働日なのに入力されていない。労働日でない日に入力されている、労働時間と工数が合わない、など)。


