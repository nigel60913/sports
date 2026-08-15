import React from 'react'

// 圓角徽章造型：橘綠對角切分，白色球體帶一道虛線弧線軌跡，暗示揮拍擊球的動態。
// 比之前的交錯箭頭在小尺寸下更容易辨識。
export default function BrandMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <defs>
        <clipPath id="badgeClip"><rect x="4" y="4" width="92" height="92" rx="24" /></clipPath>
      </defs>
      <g clipPath="url(#badgeClip)">
        <rect x="4" y="4" width="92" height="92" fill="#F2871D" />
        <polygon points="4,96 96,4 96,96" fill="#8FB524" />
      </g>
      <path d="M22,80 Q34,42 66,26" stroke="#ffffff" strokeWidth="4" fill="none"
        strokeLinecap="round" strokeDasharray="3 9" opacity="0.9" />
      <g className="animate-brandBounce" style={{ transformOrigin: '66px 26px' }}>
        <circle cx="66" cy="26" r="12" fill="#ffffff" />
        <circle cx="66" cy="26" r="12" fill="none" stroke="#2E75B6" strokeWidth="2.5" />
      </g>
    </svg>
  )
}
