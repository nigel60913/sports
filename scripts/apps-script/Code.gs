// ============================================================
// 運動啦・場次提醒信（Google Apps Script 版）
// 用法：
//   1. 把下面的 FIREBASE_PROJECT_ID 換成你自己的 Firebase 專案 ID
//   2. 手動執行一次 sendSessionReminders 完成權限授權
//   3. 用左側「觸發條件」設定每天定時執行 sendSessionReminders
// 詳細步驟請看 README.md 第 6 節
// ============================================================

const FIREBASE_PROJECT_ID = '請填入你的_FIREBASE_PROJECT_ID'
const SENDER_NAME = '運動啦'

// 選用：doPost 的簡單防濫用機制。網頁前端呼叫這個 Web App 時不需要、也不會帶任何
// Google OAuth 憑證（這正是用 Web App 當中介的用意），但因為部署成「任何人」都能呼叫，
// 網址一旦被知道，理論上誰都能打這支 API。這裡留一個很陽春的共用密語當第一道防線：
// 如果你想啟用，把下面這個值改成一串隨機字串，並且在前端的 VITE_CALENDAR_WEBHOOK_TOKEN
// 環境變數設一樣的值；不想用的話留空字串，就不會檢查。
const SHARED_SECRET = ''

function sendSessionReminders() {
  const tomorrow = taipeiDateString(1)
  Logger.log('檢查 ' + tomorrow + ' 的場次…')

  const sessions = queryFirestoreWhereEquals('sessions', 'date', tomorrow)
  if (!sessions.length) {
    Logger.log('明天沒有安排場次，不用發信')
    return
  }

  const members = listFirestoreCollection('members')
  const memberById = {}
  members.forEach(m => { memberById[m.id] = m })

  let sentCount = 0
  let skippedCount = 0

  sessions.forEach(session => {
    const attendeeIds = session.attendeeIds || []
    const types = (session.activityTypes && session.activityTypes.length)
      ? session.activityTypes
      : [session.activityType].filter(Boolean)
    const activityLabel = types.length ? types.join('、') : '運動'
    const perPerson = attendeeIds.length ? Math.round(session.totalCost / attendeeIds.length) : session.totalCost
    const payerName = session.payerId ? ((memberById[session.payerId] || {}).name || '未知') : '待確認'

    attendeeIds.forEach(id => {
      const member = memberById[id]
      if (!member || !member.email) { skippedCount++; return }

      const subject = `運動啦提醒｜明天 ${friendlyDate(session.date)} 有場次！`
      const body = [
        `${member.name} 你好，`,
        '',
        '提醒你明天有場次：',
        `日期：${friendlyDate(session.date)}`,
        `時間：${session.startTime || ''}-${session.endTime || ''}`,
        `項目：${activityLabel}`,
        `場地：${session.location || '未提供'}`,
        `費用：每人 $${perPerson}（付款人：${payerName}）`,
        '',
        '運動啦 🏸',
      ].join('\n')

      GmailApp.sendEmail(member.email, subject, body, { name: SENDER_NAME })
      Logger.log('已寄送給 ' + member.name + ' <' + member.email + '>')
      sentCount++
    })
  })

  Logger.log(`完成：寄出 ${sentCount} 封，略過 ${skippedCount} 位（沒有 Email）`)
}

// ---------------- 日期工具 ----------------

function taipeiDateString(offsetDays) {
  const now = new Date()
  const todayStr = Utilities.formatDate(now, 'Asia/Taipei', 'yyyy-MM-dd')
  const parts = todayStr.split('-').map(Number)
  const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
  utcDate.setUTCDate(utcDate.getUTCDate() + offsetDays)
  const yy = utcDate.getUTCFullYear()
  const mm = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(utcDate.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
function friendlyDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return dateStr + '（週' + WEEKDAYS[d.getDay()] + '）'
}

// ---------------- Firestore REST 呼叫 ----------------
// 用執行這個 Apps Script 的 Google 帳號本身的授權（datastore 權限），
// 不需要另外下載服務帳戶金鑰。

function firestoreBaseUrl_() {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`
}

function authHeaders_() {
  return { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }
}

function listFirestoreCollection(collection) {
  const res = UrlFetchApp.fetch(`${firestoreBaseUrl_()}/${collection}?pageSize=300`, {
    headers: authHeaders_(),
    muteHttpExceptions: true,
  })
  const json = JSON.parse(res.getContentText())
  if (json.error) throw new Error('Firestore 錯誤：' + JSON.stringify(json.error))
  return (json.documents || []).map(parseFirestoreDoc_)
}

function queryFirestoreWhereEquals(collection, field, value) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`
  const payload = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: 'EQUAL',
          value: { stringValue: value },
        },
      },
    },
  }
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: authHeaders_(),
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  })
  const json = JSON.parse(res.getContentText())
  if (json.error) throw new Error('Firestore 錯誤：' + JSON.stringify(json.error))
  return json.filter(r => r.document).map(r => parseFirestoreDoc_(r.document))
}

function parseFirestoreDoc_(doc) {
  const id = doc.name.split('/').pop()
  const data = { id }
  Object.entries(doc.fields || {}).forEach(([key, val]) => {
    data[key] = parseFirestoreValue_(val)
  })
  return data
}

function parseFirestoreValue_(val) {
  if (val.stringValue !== undefined) return val.stringValue
  if (val.integerValue !== undefined) return Number(val.integerValue)
  if (val.doubleValue !== undefined) return val.doubleValue
  if (val.booleanValue !== undefined) return val.booleanValue
  if (val.arrayValue !== undefined) return (val.arrayValue.values || []).map(parseFirestoreValue_)
  if (val.mapValue !== undefined) {
    const obj = {}
    Object.entries(val.mapValue.fields || {}).forEach(([k, v]) => { obj[k] = parseFirestoreValue_(v) })
    return obj
  }
  if (val.nullValue !== undefined) return null
  return null
}

// ============================================================
// Web App 端點：新增場次時，前端會 POST 過來，這裡負責建立
// Google 日曆活動並寄出邀請信給參加者。
//
// 部署方式：右上角「部署」→「新增部署作業」→ 選「網頁應用程式」，
//   執行身分選「我」，誰可以存取選「所有人」，部署後拿到的網址
//   就是前端要打的 VITE_CALENDAR_WEBHOOK_URL。
// ============================================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: '沒有收到資料' })
    }

    const data = JSON.parse(e.postData.contents)

    if (SHARED_SECRET && data.token !== SHARED_SECRET) {
      return jsonResponse_({ ok: false, error: '驗證失敗' })
    }

    const { date, startTime, endTime, activityTypes, location, attendees } = data
    if (!date || !startTime || !endTime) {
      return jsonResponse_({ ok: false, error: '缺少日期或時間' })
    }

    // 沒有 email 的參加者略過
    const guestEmails = (attendees || [])
      .map(a => (typeof a === 'string' ? a : (a && a.email)))
      .filter(email => !!email)

    const title = '運動啦・' + ((activityTypes && activityTypes.length) ? activityTypes.join('、') : '運動')
    const startDateTime = new Date(date + 'T' + startTime + ':00')
    const endDateTime = new Date(date + 'T' + endTime + ':00')

    const eventOptions = { location: location || '' }
    if (guestEmails.length) {
      eventOptions.guests = guestEmails.join(',')
      eventOptions.sendInvites = true
    }

    const event = CalendarApp.getDefaultCalendar().createEvent(title, startDateTime, endDateTime, eventOptions)
    event.setVisibility(CalendarApp.Visibility.PRIVATE)

    return jsonResponse_({ ok: true, eventId: event.getId(), invited: guestEmails.length })
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) })
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
