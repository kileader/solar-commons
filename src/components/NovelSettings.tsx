import { useState } from 'react'
import { AudioSettings, ControllerSettings } from './AudioSettings'
import { PageButtons } from './PagedReader'
import type { useAudio } from '../hooks/useAudio'
import type { useMotion } from '../hooks/useMotion'
import type { ControllerStatus } from '../hooks/useGamepad'
import type { ReadingPreferences } from '../reading/preferences'

export function NovelSettings({
  audio,
  motion,
  controller,
  reading,
  updateReading,
  auto,
  setAuto,
}: {
  audio: ReturnType<typeof useAudio>
  motion: ReturnType<typeof useMotion>
  controller: ControllerStatus
  reading: ReadingPreferences
  updateReading: (patch: Partial<ReadingPreferences>) => void
  auto: boolean
  setAuto: (enabled: boolean) => void
}) {
  const [section, setSection] = useState<'Reading' | 'Sound' | 'Controls'>('Reading')
  const [page, setPage] = useState(0)
  return (
    <>
      <nav className="settings-sections" aria-label="Settings sections">
        {(['Reading', 'Sound', 'Controls'] as const).map((name) => (
          <button
            key={name}
            aria-pressed={section === name}
            aria-controls="settings-section"
            onClick={() => {
              setSection(name)
              setPage(0)
            }}
          >
            {name}
          </button>
        ))}
      </nav>
      <div id="settings-section" className="settings-section" aria-label={`${section} settings`}>
        {section === 'Reading' && (
          <>
            {page === 0 && (
              <>
                <label className="setting-row">
                  <span>
                    <strong>Autoplay dialogue</strong>
                    <small>
                      Scroll and continue automatically; choices and model controls wait for you.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={auto}
                    onChange={(event) => setAuto(event.target.checked)}
                  />
                </label>
                <label className="volume-row">
                  <span>
                    Pause between boxes<output>{reading.autoDelay.toFixed(1)} s</output>
                  </span>
                  <input
                    aria-label="Pause between boxes"
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={reading.autoDelay}
                    onChange={(event) => updateReading({ autoDelay: Number(event.target.value) })}
                  />
                </label>
                <p className="settings-description">
                  The pause starts after the voice finishes. Unvoiced text gets reading time first.
                </p>
              </>
            )}
            {page === 1 && (
              <>
                <label className="volume-row">
                  <span>
                    Unvoiced reading pace<output>{reading.readingSpeed} words/min</output>
                  </span>
                  <input
                    aria-label="Unvoiced reading pace"
                    type="range"
                    min="120"
                    max="300"
                    step="20"
                    value={reading.readingSpeed}
                    onChange={(event) =>
                      updateReading({ readingSpeed: Number(event.target.value) })
                    }
                  />
                </label>
                <label className="setting-row">
                  <span>
                    <strong>Larger dialogue</strong>
                    <small>A little more room for the words.</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={reading.largeText}
                    onChange={(event) => updateReading({ largeText: event.target.checked })}
                  />
                </label>
                <label className="setting-row">
                  <span>
                    <strong>Reduce motion</strong>
                    <small>
                      {motion.systemReduced
                        ? 'Your system preference is already active.'
                        : 'Still the parallax, floating geometry, and transitions.'}
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    checked={motion.reduced}
                    disabled={motion.systemReduced}
                    onChange={(event) => motion.setManualReduced(event.target.checked)}
                  />
                </label>
              </>
            )}
          </>
        )}
        {section === 'Sound' && <AudioSettings audio={audio} page={page} />}
        {section === 'Controls' && <ControllerSettings controller={controller} page={page} />}
      </div>
      <PageButtons
        index={page}
        count={section === 'Reading' ? 2 : section === 'Sound' ? 4 : 3}
        onPage={setPage}
      />
    </>
  )
}
