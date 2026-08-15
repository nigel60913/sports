# 運動啦 🏸🎾

同事朋友揪團打球用的小工具：行事曆、分帳、場次紀錄、人員管理、匯款資訊、羽球 / 匹克球計分器。
前端純靜態網站（React + Vite + Tailwind），部署在 GitHub Pages；資料庫用 Firebase Firestore。
**整個專案只用 Firestore，不用 Firebase Storage，完全在免費的 Spark 方案內運作，不需要綁信用卡。**
（QR code 圖片會在瀏覽器端先壓縮成小尺寸，再直接存進 Firestore 文件裡。）

---

## 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)，用 Google 帳號登入。
2. 點「建立專案」（Create a project），輸入專案名稱（例如 `yundongla`），一路 Continue 到底（Google Analytics 那步可以關掉，不需要）。
3. 建立完成後會進到「專案總覽」頁面。左側選單點「建構」(Build) →「Firestore Database」→ 點「建立資料庫」。
   - 位置選離台灣近的（例如 `asia-east1`）。
   - 安全性規則先選「以測試模式啟動」，等一下會換成專案裡附的正式規則。
4. 回到專案總覽頁，點畫面中的網頁圖示 `</>`（Add app → Web），幫應用程式取個暱稱（例如「運動啦」），**不用勾選 Firebase Hosting**，按「註冊應用程式」。
5. 註冊完會顯示一段 `firebaseConfig` 程式碼，長得像這樣：

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "yundongla-xxxx.firebaseapp.com",
     projectId: "yundongla-xxxx",
     storageBucket: "yundongla-xxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   }
   ```

   把 `apiKey`、`authDomain`、`projectId`、`messagingSenderId`、`appId` 這 5 個值記下來（`storageBucket` 這個專案用不到，可以不管）。

### 套用安全性規則

專案根目錄有 `firestore.rules`，內容是「知道連結就能讀寫」的開放規則（因為你選擇不加登入驗證，走信任圈內人的模式）。

**用網頁介面設定（最簡單，不用裝任何東西）：**
Firebase Console → 左側「Firestore Database」→ 上方「規則」分頁 → 把 `firestore.rules` 檔案裡的內容整段複製貼上覆蓋 → 按「發布」。

> ⚠️ 提醒：測試模式的預設規則 30 天後會自動失效（拒絕所有讀寫），一定要照上面步驟換成規則才會長期有效。
> 開放規則代表任何拿到網址的人都能改資料，適合朋友小圈子；之後想加保護的話，可以請我幫你加上 Google 登入 + 白名單驗證。

---

## 2. 本機開發（想先在自己電腦上試跑的話）

```bash
npm install
cp .env.example .env
# 把 .env 裡五個欄位填入步驟 1.5 記下來的值
npm run dev
```

打開瀏覽器看 `http://localhost:5173` 即可。這步是選用的，直接跳到步驟 3 部署到 GitHub Pages 也可以。

---

## 3. 部署到 GitHub Pages

1. 把這個資料夾 push 到你自己的 GitHub repo（public 或 private 都可以，但 Pages 免費方案要 public repo 才能開）。
2. Repo 上方「Settings」→ 左側「Secrets and variables」→「Actions」→ 「New repository secret」，新增以下 5 筆（名稱要完全一樣，值就是步驟 1.5 記下來的內容）：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. 「Settings」→「Pages」→「Build and deployment」→ Source 選「Deploy from a branch」→ Branch 選 `gh-pages` / `/(root)`（第一次要等 Actions 跑完一次、產生 `gh-pages` 分支後才會出現這個選項，先跳到下一步）。
4. push 到 `main` 分支後，上方選單「Actions」分頁可以看到 workflow 自動開始跑，跑完（通常 1-2 分鐘）就會建立 `gh-pages` 分支並部署完成。回到步驟 3 把 Pages 設定好，就能拿到網址了。

之後每次改完程式碼、想更新網站，只要 push 到 `main` 就會自動重新部署。

---

## 4. 功能總覽

| 頁面 | 說明 |
|---|---|
| 首頁 | 月曆檢視，標註哪天有場次，點日期看當天細節 |
| 分帳 | 依場次紀錄自動計算，並用債務簡化演算法算出最少轉帳筆數；可展開看付款方式與相關場次；可按「全部結清」把當期歸零 |
| 場次紀錄 | 新增/編輯/刪除場次：時間、活動項目（可自訂）、費用、付款人、出席名單、場地 |
| 人員設定 | 新增/編輯/刪除人員，可停用（保留歷史紀錄但不出現在新場次選單） |
| 匯款資訊 | 每人可設定多種收款方式（LinePay / 轉帳 / 其他）並上傳 QR code（自動壓縮後存進 Firestore） |
| 計分 | 羽球（21 分制，20 平需領先 2 分，最高 30 分）與匹克球（11 分制、雙打三數字報分法）計分器，手機大按鈕操作 |

## 5. 之後可以擴充的方向

- 加上 Google 登入 + 白名單保護資料
- 場次「我要來」報名機制，取代手動勾選出席
- 個人歷史戰績 / 花費統計頁
- 深色模式
- PWA（加到手機主畫面）
