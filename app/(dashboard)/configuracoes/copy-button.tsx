'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors"
      aria-label="Copiar código de convite"
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
    </button>
  )
}
