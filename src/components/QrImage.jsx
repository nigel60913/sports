import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, X } from 'lucide-react'

// 縮圖可點擊放大成全螢幕，方便實際掃描轉帳
export default function QrImage({ src, label, size = 'md' }) {
  const [open, setOpen] = useState(false)
  const dims = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'

  if (!src) {
    return (
      <div className={`${dims} rounded-lg bg-black/5 flex items-center justify-center text-ink/30 shrink-0`}>
        <QrCode size={size === 'lg' ? 32 : 22} />
      </div>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${dims} shrink-0`}>
        <img src={src} alt={label || 'QR code'} className="w-full h-full rounded-lg object-cover border border-black/10" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 max-w-[90vw]">
              {label && <div className="text-base font-semibold text-ink">{label}</div>}
              <img src={src} alt={label || 'QR code'} className="w-72 h-72 max-w-full rounded-xl object-contain" />
              <button onClick={() => setOpen(false)} className="flex items-center gap-1 text-sm text-ink/50 mt-1">
                <X size={16} /> 關閉
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
