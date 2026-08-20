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
| 首頁 | 上方直接列出即將到來的場次，下方是精簡版月曆可切換查看特定日期 |
| 場次紀錄 | 新增/編輯/刪除場次：時間（預設 18:00-21:00）、活動項目（可複選、可自訂、可刪除）、費用、付款人、出席名單、場地；可直接「我要加入」 |
| 分帳 | 直接列出每一筆場次的付款狀態，每個出席者可個別標記已付款/未付款，金額四捨五入不留小數；可展開看付款人的收款方式 |
| 人員設定 | 新增/編輯/刪除人員，可停用（保留歷史紀錄但不出現在新場次選單）；刪除人員會自動從相關場次清除，人數與分攤金額自動重新計算 |
| 匯款資訊 | 每人可設定多種收款方式（LinePay / 轉帳 / 其他）並上傳 QR code（自動壓縮後存進 Firestore，可點圖放大方便掃描） |
| 計分 | 羽球（21 分制，20 平需領先 2 分，最高 30 分）與匹克球（11 分制、雙打三數字報分法）計分器，隊名可自訂，手機大按鈕操作 |

## 5. 之後可以擴充的方向

- 加上 Google 登入 + 白名單保護資料
- 個人歷史戰績 / 花費統計頁
- 深色模式
- PWA（加到手機主畫面）

---

## 6. 場次提醒信（選用功能・Google Apps Script 版）

會在**場次前一天**自動寄提醒信給已經勾選出席的人（要先在人員設定填 Email 才收得到）。用 **Google Apps Script** 實作：定時觸發器負責排程，`GmailApp` 負責寄信，完全免費、不需要信用卡、不需要另外申請第三方服務、也不需要下載 Firebase 服務帳戶金鑰。

程式碼在 `scripts/apps-script/`：`Code.gs`（主程式）和 `appsscript.json`（權限設定）。

> ⚠️ 有個前提：建議用**當初建立 Firebase 專案的那個 Google 帳號**來設定這個 Apps Script，這樣它才會自動有讀取你 Firestore 資料庫的權限。如果是別的帳號（例如 Workspace 裡的其他成員），要先到 [Google Cloud Console](https://console.cloud.google.com/) →選你的專案 →「IAM 與管理」，把那個帳號加進去、給予「Cloud Datastore User」角色，才讀得到資料。

### 6.1 建立 Apps Script 專案

1. 前往 [script.google.com](https://script.google.com/)，用建立 Firebase 專案的那個 Google 帳號登入
2. 點「新增專案」
3. 左上角把預設專案名稱改成「運動啦提醒信」之類好辨認的名字
4. 把左側 `Code.gs` 的內容全部刪掉，貼上 `scripts/apps-script/Code.gs` 的內容
5. 把最上面 `FIREBASE_PROJECT_ID` 那行的值換成你自己的 Firebase 專案 ID（在 Firebase Console →專案設定 →一般 分頁可以找到，跟你網頁 `.env` 裡 `VITE_FIREBASE_PROJECT_ID` 的值一樣）

### 6.2 設定權限範圍

1. 左側點齒輪圖示「專案設定」，勾選「在編輯器中顯示 appsscript.json 資訊清單檔案」
2. 回到編輯器，左側檔案列表會多出 `appsscript.json`，點開，把內容整個換成 `scripts/apps-script/appsscript.json` 的內容，存檔

### 6.3 第一次手動執行、完成授權

1. 上方函式下拉選單選擇 `sendSessionReminders`，點「執行」（三角形播放鈕）
2. 第一次執行會跳出「需要授權」的視窗，點「檢查權限」→選你的帳號 →因為這是你自己寫的小工具，Google 會顯示「這個應用程式未經 Google 驗證」的警告，屬於正常狀況，點左下角「進階」→「前往（不安全）」→「允許」
3. 授權完成後會自動執行一次，可以到「執行項目」分頁看記錄，或「Firestore 場次」裡先手動建一筆明天的測試場次來驗證有沒有收到信

### 6.4 設定每天自動執行

1. 左側點時鐘圖示「觸發條件」
2. 右下角「新增觸發條件」
3. 選要執行的函式：`sendSessionReminders`
4. 事件來源選「時間驅動」→「日計時器」→選一個時段（例如晚上 8 點到 9 點之間，Apps Script 只能選區間，不是精確時間）
5. 儲存

設定完成後就不用再管它了，之後每天都會自動檢查「明天」有沒有場次，有的話寄信給有填 Email 的出席者。

### 6.5 之前 EmailJS / GitHub Actions 的版本

如果你之前已經照舊版說明設定過 EmailJS 和 GitHub Secrets，這個新版本上線後那些設定可以不用管它（不會衝突，只是變成沒有用），或者乾脆到 EmailJS 後台刪除帳號、GitHub Secrets 裡把 `EMAILJS_*` 和 `FIREBASE_SERVICE_ACCOUNT` 都移除，保持乾淨。

---

## 7. 新增場次自動寄 Google 日曆邀請（選用功能）

新增場次成功後，網頁會呼叫同一個 Apps Script 專案（第 6 節那個）多加的一個 Web App 端點，自動在你的 Google 日曆建立一筆活動、把有填 Email 的出席者加為賓客並寄出邀請信，活動可見度設為「私人」。

**運作方式**：前端不會用到任何 Google OAuth 憑證——它只是把場次資料 POST 給一個固定網址（Apps Script Web App），實際「用哪個 Google 帳號的權限去操作日曆」是在 Apps Script 那一側決定的（部署時設定「執行身分：我」），前端完全不需要、也不會知道任何登入憑證。

### 7.1 在 Apps Script 裡加上這段程式碼

如果你是照第 6 節的步驟設定的，`scripts/apps-script/Code.gs` 這個檔案這次已經多了 `doPost` 相關的程式碼，直接把整個檔案內容重新複製貼上覆蓋掉你 Apps Script 編輯器裡原本的版本即可（`appsscript.json` 也要一起換，多了 Calendar 的權限）。

### 7.2 部署成 Web App

1. Apps Script 編輯器右上角「部署」→「新增部署作業」
2. 左邊齒輪圖示選「網頁應用程式」
3. 「執行身分」選 **我**（這樣建立的日曆活動會出現在你自己的 Google 日曆）
4. 「誰可以存取」選 **所有人**（這樣網頁前端才能呼叫，不需要對方登入）
5. 點「部署」，第一次會再跳一次權限授權（跟第 6 節一樣的流程，點「進階」→「前往」→「允許」）
6. 完成後會顯示一個網址，長得像 `https://script.google.com/macros/s/xxxxxxxx/exec`，複製起來，這就是 `VITE_CALENDAR_WEBHOOK_URL`

> 之後如果又修改了 Code.gs 內容，要記得「新增部署作業」重新部署一次（或用「管理部署作業」更新既有版本），不然網址還是跑舊的程式碼。

### 7.3 設定前端環境變數

跟 Firebase 的 5 個金鑰一樣，多加兩筆 GitHub Secrets（Repo → Settings → Secrets and variables → Actions）：

| Secret 名稱 | 值 |
|---|---|
| `VITE_CALENDAR_WEBHOOK_URL` | 步驟 7.2 拿到的網址 |
| `VITE_CALENDAR_WEBHOOK_TOKEN` | 選填，見下方說明 |

本機開發的話，一樣填到 `.env` 裡對應的兩個欄位。**這個功能是選用的**：如果不填 `VITE_CALENDAR_WEBHOOK_URL`，前端就完全不會呼叫它，其他功能不受影響。

### 7.4 關於安全性，要老實跟你說

因為 Web App 部署成「誰都能存取」，這個網址本質上是公開的——任何拿到這串網址的人都可以直接呼叫它、在你的日曆裡建立活動。這不是「洩漏 Google 帳密」等級的風險（對方拿不到你帳號的任何存取權，只能觸發這一支功能），但確實有可能被惡搞。

`Code.gs` 裡留了一個很陽春的共用密語機制：把 `Code.gs` 最上面的 `SHARED_SECRET` 改成一串你自己隨便打的亂數字串（例如 `openssl rand -hex 16` 或直接亂敲鍵盤），然後 `VITE_CALENDAR_WEBHOOK_TOKEN` 也填一樣的值——注意**這串字最終還是會出現在網頁的原始碼裡**（因為前端本來就得知道它才能送出去），所以這只能擋掉「隨便亂猜網址亂打」的路人，擋不住真的想找碴、會去看網頁原始碼的人。如果不想處理這個，`SHARED_SECRET` 留空字串就好，不影響其他功能，只是少一層防護。

對一個朋友揪團用的小工具來說，這樣的防護程度算是合理的取捨；如果之後想要更嚴謹的做法（例如真的要求呼叫端登入驗證），可以再告訴我，但那會需要更複雜的架構。
