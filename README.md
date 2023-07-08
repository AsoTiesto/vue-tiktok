# vue-tiktok

This template should help get you started developing with Vue 3 in Vite.

## 使用方式

```sh
npm i & npm run dev
```
## 加分題 solution 回答

在前端可以追蹤目前影片的播放時間，當影片播放時間超過5分鐘時，暫停影片或者將 currentTime 設置為0。

如果單單只在前端做會稍微危險一點

為了安全起見，還是建議搭配後端進行驗證。假設平台是有 user 的，應該對此 user 加入權限的判斷，當 user 在觀看影片時，
前端應該向後端發送 token 請求，後端需要判斷該 user 是否有觀看影片的權限，如果只有試看權限，那後端需要回傳參數給前端判斷。

此外後端也可以提供試看版本 .m3u8 短版的影片內容(5分鐘)。

可以儲存兩種的影片, 一種是完整版的, 一種是試看版的。
