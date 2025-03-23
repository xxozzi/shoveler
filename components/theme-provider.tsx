'use client'

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // alr, we gotta wait for the component to mount before rendering
  // this stops the hydration mismatch between server + client

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // btw, during server rendering or initial client render,
  // we just render without theme to avoid any mismatches

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
