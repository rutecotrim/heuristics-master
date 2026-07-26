import type { ReactNode } from 'react'

interface ScreenShellProps {
  children: ReactNode
  wide?: boolean
  className?: string
}

/** Centers content in the viewport with banner-safe top padding. */
export function ScreenShell({ children, wide = false, className = '' }: ScreenShellProps) {
  return (
    <div className={`screen-shell ${wide ? 'screen-shell--wide' : ''} ${className}`.trim()}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">{children}</div>
    </div>
  )
}
