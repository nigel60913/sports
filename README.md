# 運動啦 🏸🎾

同事朋友揪團打球用的小工具：行事曆、分帳、場次紀錄、人員管理、匯款資訊、羽球 / 匹克球計分器。
前端純靜態網站（React + Vite + Tailwind），部署在 GitHub Pages；資料庫用 Firebase（Firestore + Storage），完全免費額度內可用。

---

## 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)，建立新專案（例如叫 `yundongla`）。
2. 左側選單「建構」→「Firestore Database」→ 建立資料庫，選「以測試模式啟動」（之後我們會換成自訂規則）。
3. 左側選單「建構」→「Storage」→ 開始使用（用來存轉帳 QR code 圖片）。
4. 左側選單「專案總覽」旁的齒輪 →「專案設定」→ 拉到「你的應用程式」→ 點 `</>` 網頁圖示，註冊一個網頁應用程式（不用勾 Firebase Hosting）。
5. 註冊完會顯示一段 `firebaseConfig`，把裡面 6 個值記下來，等一下要用。

### 套用安全性規則

專案根目錄有 `firestore.rules` 和 `storage.rules` 兩個檔案，內容是「知道連結就能讀寫」的開放規則（因為你們選擇不加登入驗證，走信任圈內人的模式）。

用 [Firebase CLI](https://firebase.google.com/docs/cli) 部署最快：

```bash
npm install -g firebase-tools
firebase login
firebase init firestore storage   # 專案選你剛建立的那個，規則檔案路徑用預設值即可（會覆蓋成本專案內的 firestore.rules / storage.rules）
firebase deploy --only firestore:rules,storage:rules
```

也可以不用 CLI，直接把兩個檔案的內容複製貼到 Firebase Console 裡「Firestore Database → 規則」和「Storage → 規則」分頁，按發布。

> ⚠️ 提醒：測試模式的預設規則 30 天後會自動失效（拒絕所有讀寫），一定要照上面步驟換成 repo 裡的規則才會長期有效。
> 開放規則代表任何拿到網址的人都能改資料，適合朋友小圈子，但如果之後想加保護，可以請我幫你加上 Google 登入 + 白名單驗證。

---

## 2. 本機開發

```bash
npm install
cp .env.example .env
# 把 .env 裡六個欄位填入 Firebase 專案設定值
npm run dev
```

打開瀏覽器看 `http://localhost:5173` 即可。

---

## 3. 部署到 GitHub Pages

1. 把這個資料夾 push 到你自己的 GitHub repo（public 或 private 都可以，Pages 免費方案 public repo 才能開）。
2. Repo 設定 → Settings → Secrets and variables → Actions → 新增以下 6 個 Repository secrets（值就是 `.env` 裡的內容）：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Repo 設定 → Settings → Pages → Build and deployment → Source 選「Deploy from a branch」→ Branch 選 `gh-pages` / `/(root)`。
4. push 到 `main` 分支後，`.github/workflows/deploy.yml` 會自動 build 並發布到 `gh-pages` 分支，第一次跑完後到 Pages 設定頁就能看到網址了。

之後每次改完程式碼、想更新網站，只要 push 到 `main` 就會自動重新部署。

---

## 4. 功能總覽

| 頁面 | 說明 |
|---|---|
| 首頁 | 月曆檢視，標註哪天有場次，點日期看當天細節 |
| 分帳 | 依場次紀錄自動計算，並用債務簡化演算法算出最少轉帳筆數；可展開看付款方式與相關場次；可按「全部結清」把當期歸零 |
| 場次紀錄 | 新增/編輯/刪除場次：時間、活動項目（可自訂）、費用、付款人、出席名單、場地 |
| 人員設定 | 新增/編輯/刪除人員，可停用（保留歷史紀錄但不出現在新場次選單） |
| 匯款資訊 | 每人可設定多種收款方式（LinePay / 轉帳 / 其他）並上傳 QR code |
| 計分 | 羽球（21 分制，20 平需領先 2 分，最高 30 分）與匹克球（11 分制、雙打三數字報分法）計分器，手機大按鈕操作 |

## 5. 之後可以擴充的方向

- 加上 Google 登入 + 白名單保護資料
- 場次「我要來」報名機制，取代手動勾選出席
- 個人歷史戰績 / 花費統計頁
- 深色模式
- PWA（加到手機主畫面）
