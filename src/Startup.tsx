import { useCallback, useState } from 'react'
import App from './App'
import { StudioSplash } from './components/StudioSplash'

export default function Startup() {
  const [ready, setReady] = useState(false)
  const enterHarbor = useCallback(() => setReady(true), [])
  // Only mount gameplay/input/audio after the silent studio presentation.
  return ready ? <App /> : <StudioSplash onComplete={enterHarbor} />
}
