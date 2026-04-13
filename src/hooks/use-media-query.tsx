'use client'

import * as React from 'react'

const DESKTOP_BREAKPOINT = 1024

export function useIsDesktop() {
    const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

    React.useEffect(() => {
        const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`)
        const onChange = () => {
            setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
        }
        mql.addEventListener('change', onChange)
        setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
        return () => mql.removeEventListener('change', onChange)
    }, [])

    return !!isDesktop
}

export function useMediaQuery(query: string) {
    const [matches, setMatches] = React.useState<boolean>(false)

    React.useEffect(() => {
        const mql = window.matchMedia(query)
        const onChange = () => {
            setMatches(mql.matches)
        }
        mql.addEventListener('change', onChange)
        setMatches(mql.matches)
        return () => mql.removeEventListener('change', onChange)
    }, [query])

    return matches
}
