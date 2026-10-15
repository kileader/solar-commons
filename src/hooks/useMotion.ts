import { useEffect, useState } from 'react'

export function useMotion() {
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [manualReduced, setManualReduced] = useState(() => {
    try {
      return localStorage.getItem('solar-commons.reduced-motion.v1') === 'true'
    } catch {
      return false
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('solar-commons.reduced-motion.v1', String(manualReduced))
    } catch {
      /* Optional persistence. */
    }
  }, [manualReduced])
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setSystemReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return { reduced: systemReduced || manualReduced, manualReduced, setManualReduced, systemReduced }
}
