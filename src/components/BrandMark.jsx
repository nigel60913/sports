import React from 'react'

// 呼應 logo 的交錯箭頭意象，頁面載入時滑入交會，作為品牌識別的簽名動畫
export default function BrandMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <polygon points="10,45 45,10 60,25 35,50 45,60 70,35 90,55 55,90 40,75 65,50 55,40 30,65 10,45"
        fill="#8FB524" className="animate-crossIn" />
      <polygon points="90,45 55,10 40,25 65,50 55,60 30,35 10,55 45,90 60,75 35,50 45,40 70,65 90,45"
        fill="#F2871D" className="animate-crossInRev" />
      <polygon points="58,28 70,40 58,40" fill="#2E75B6" />
    </svg>
  )
}
