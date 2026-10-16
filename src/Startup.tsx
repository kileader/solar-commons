import { useCallback, useState } from 'react'
import App from './App'
import { StudioSplash } from './components/StudioSplash'
import { OpeningCinematic } from './components/OpeningCinematic'
import { sceneAtStart, type StoryStart } from './state/scene'

export default function Startup() {
  const [stage, setStage] = useState<'studio' | 'opening' | 'harbor'>('studio')
  const [storyStart, setStoryStart] = useState<StoryStart>({ scene: 'harbor' })
  const enterOpening = useCallback(() => setStage('opening'), [])
  const enterHarbor = useCallback((start: StoryStart = { scene: 'harbor' }) => {
    setStoryStart(start)
    setStage('harbor')
  }, [])
  // Each presentation owns its input and audio until the next stage mounts.
  if (stage === 'studio') return <StudioSplash onComplete={enterOpening} />
  if (stage === 'opening') return <OpeningCinematic onComplete={enterHarbor} />
  return <App initialState={sceneAtStart(storyStart)} onPrologue={enterOpening} />
}
