import React, { useState } from 'react'
import { Plus, Trash2, QrCode, ChevronDown } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { fileToCompressedDataURL } from '../utils/image.js'

const METHOD_TYPES = ['LinePay', '銀行轉帳', '其他']

export default function PaymentInfo() {
  const { members, updateMember } = useData()
  const [openId, setOpenId] = useState(null)

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">匯款資訊</h1>
      <p className="text-sm text-ink/50">設定每個人的收款方式，分帳時會直接顯示給付款人看</p>

      <div className="space-y-3">
        {members.map(m => (
          <MemberPaymentCard key={m.id} member={m} open={openId === m.id}
            onToggle={() => setOpenId(openId === m.id ? null : m.id)}
            onSave={(paymentMethods) => updateMember(m.id, { paymentMethods })} />
        ))}
      </div>
    </div>
  )
}

function MemberPaymentCard({ member, open, onToggle, onSave }) {
  const methods = member.paymentMethods || []
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ type: 'LinePay', account: '' })

  const addMethod = async () => {
    if (!form.account.trim()) return
    await onSave([...methods, { id: crypto.randomUUID(), type: form.type, account: form.account.trim(), qrcodeUrl: '' }])
    setForm({ type: 'LinePay', account: '' })
  }

  const removeMethod = (id) => onSave(methods.filter(x => x.id !== id))

  const uploadQr = async (methodId, file) => {
    if (!file) return
    setUploading(true)
    try {
      // 圖片在瀏覽器端壓縮成小尺寸 JPEG，直接以 dataURL 存進 Firestore，
      // 不經過 Firebase Storage，完全在免費 Spark 方案內運作。
      const dataUrl = await fileToCompressedDataURL(file)
      onSave(methods.map(x => x.id === methodId ? { ...x, qrcodeUrl: dataUrl } : x))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3">
        <span className="font-medium text-sm text-ink">{member.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink/40">{methods.length} 種收款方式</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-black/5 pt-3">
          {methods.map(mth => (
            <div key={mth.id} className="flex items-center gap-3 bg-paper rounded-xl p-3">
              {mth.qrcodeUrl ? (
                <img src={mth.qrcodeUrl} alt="qrcode" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center text-ink/30"><QrCode size={20} /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-ink">{mth.type}</div>
                <div className="text-xs text-ink/50 truncate">{mth.account}</div>
                <label className="text-[11px] text-accent cursor-pointer">
                  {mth.qrcodeUrl ? '更換 QR code' : '上傳 QR code'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => uploadQr(mth.id, e.target.files[0])} />
                </label>
              </div>
              <button onClick={() => removeMethod(mth.id)} className="text-ink/30 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}

          <div className="flex gap-2">
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="rounded-lg border border-black/10 px-2 py-2 text-xs">
              {METHOD_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={form.account} onChange={e => setForm(f => ({ ...f, account: e.target.value }))}
              placeholder="帳號 / Line ID" className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-xs" />
            <button onClick={addMethod} className="bg-orange text-white rounded-lg px-3"><Plus size={16} /></button>
          </div>
          {uploading && <div className="text-[11px] text-ink/40">上傳中…</div>}
        </div>
      )}
    </div>
  )
}
