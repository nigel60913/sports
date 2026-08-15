// Firebase 初始化。請在 GitHub repo 的 Settings > Secrets 設定下方六個環境變數，
// 或本機開發時複製 .env.example 為 .env 並填入你的 Firebase 專案設定值。
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// 沒有用到 Firebase Storage：QR code 圖片壓縮後直接存在 Firestore 文件裡，
// 所以完全在免費的 Spark 方案內運作，不需要信用卡。
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
