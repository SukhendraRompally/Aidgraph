export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="7" fill="#2B6B4A"/>
      <line x1="16" y1="10" x2="9" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <line x1="16" y1="10" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <line x1="9" y1="23" x2="23" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <circle cx="16" cy="10" r="2.8" fill="white"/>
      <circle cx="9" cy="23" r="2.8" fill="white"/>
      <circle cx="23" cy="23" r="2.8" fill="white"/>
    </svg>
  )
}
