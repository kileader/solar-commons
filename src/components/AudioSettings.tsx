import { Volume2 } from 'lucide-react'
import type { useAudio } from '../hooks/useAudio'
import type { ControllerStatus } from '../hooks/useGamepad'

type AudioControls = ReturnType<typeof useAudio>

export function AudioSettings({ audio }: { audio: AudioControls }) {
  const { preferences, voices } = audio
  const levels = [
    { key: 'master', label: 'Master' },
    { key: 'music', label: 'Music' },
    { key: 'voice', label: 'Voice' },
    { key: 'effects', label: 'Sound effects' },
  ] as const
  return (
    <section className="audio-settings" aria-labelledby="audio-settings-title">
      <h3 id="audio-settings-title">Sound & voice</h3>
      <p className="settings-description">
        Recorded character voices, an ambient score, and soft feedback.
      </p>
      <label className="setting-row compact-setting">
        <span>
          <strong>Mute all sound</strong>
        </span>
        <input
          type="checkbox"
          checked={preferences.muted}
          onChange={(event) => {
            audio.update({ muted: event.target.checked })
            audio.unlock()
          }}
        />
      </label>
      {levels.map(({ key, label }) => (
        <label className="volume-row" key={key}>
          <span>
            {label}
            <output>{Math.round(preferences[key] * 100)}%</output>
          </span>
          <input
            aria-label={`${label} volume`}
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(preferences[key] * 100)}
            onChange={(event) => {
              audio.update({ [key]: Number(event.target.value) / 100 })
              audio.play('slider')
            }}
          />
        </label>
      ))}
      <label className="setting-row">
        <span>
          <strong>Play dialogue voices</strong>
          <small>Uses the supplied recordings where available.</small>
        </span>
        <input
          type="checkbox"
          checked={preferences.voiceEnabled}
          onChange={(event) => {
            audio.update({ voiceEnabled: event.target.checked })
            audio.play('confirm')
          }}
        />
      </label>
      <label className="setting-row">
        <span>
          <strong>Device voice fallback</strong>
          <small>Read unrecorded lines with a local English voice. Off keeps them text-only.</small>
        </span>
        <input
          type="checkbox"
          checked={preferences.deviceVoiceFallback}
          disabled={voices.length === 0}
          onChange={(event) => audio.update({ deviceVoiceFallback: event.target.checked })}
        />
      </label>
      {voices.length ? (
        <>
          <label className="voice-choice">
            <span>Fallback voice</span>
            <select
              aria-label="Fallback voice"
              value={
                voices.some((voice) => voice.voiceURI === preferences.voiceURI)
                  ? preferences.voiceURI
                  : ''
              }
              onChange={(event) => {
                audio.update({ voiceURI: event.target.value })
                audio.play('choice')
              }}
            >
              <option value="">Character voices (automatic)</option>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <p className="settings-description voice-unavailable" role="status">
          No local English fallback voice is available in this browser. Recordings still play.
        </p>
      )}
      <button
        className="voice-test"
        disabled={
          preferences.muted ||
          !preferences.voiceEnabled ||
          preferences.master * preferences.voice === 0
        }
        onClick={audio.testVoice}
      >
        <Volume2 size={16} /> Try Kite’s recorded voice
      </button>
      <p className="settings-description">
        The harbor and opening are voiced. Museum recordings are still to come.
      </p>
      {audio.voiceState === 'error' && (
        <p className="settings-description" role="status">
          Voice playback could not start. Try the voice button again.
        </p>
      )}
    </section>
  )
}

export function ControllerSettings({ controller }: { controller: ControllerStatus }) {
  return (
    <>
      <div className="controller-guide">
        <h3>Controller</h3>
        <p>
          {controller === 'connected'
            ? 'Controller connected.'
            : controller === 'unsupported-mapping'
              ? 'This controller has no standard mapping in this browser.'
              : controller === 'unavailable'
                ? 'Gamepad input is unavailable in this browser.'
                : 'Connect a controller and press a button to activate it.'}
        </p>
        <dl>
          <div>
            <dt>D-pad / left stick</dt>
            <dd>Move between controls</dd>
          </div>
          <div>
            <dt>A / Cross</dt>
            <dd>Continue or select</dd>
          </div>
          <div>
            <dt>B / Circle</dt>
            <dd>Close a panel</dd>
          </div>
          <div>
            <dt>X / Square</dt>
            <dd>Cognitive Perception</dd>
          </div>
          <div>
            <dt>Y / Triangle</dt>
            <dd>Field notes</dd>
          </div>
          <div>
            <dt>Start / Options</dt>
            <dd>Settings</dd>
          </div>
          <div>
            <dt>LB / L1 · RB / R1</dt>
            <dd>Replay voice · mute</dd>
          </div>
          <div>
            <dt>Right stick</dt>
            <dd>Scroll panels</dd>
          </div>
        </dl>
        <p>
          Use left/right to adjust a selected volume or voice. If controller audio is blocked, click
          Enable sound once.
        </p>
      </div>
      <div className="keyboard-guide">
        <span>KEYBOARD</span>
        <p>
          <kbd>Enter</kbd> / <kbd>Space</kbd> Continue <kbd>A</kbd> Auto
        </p>
        <p>
          <kbd>C</kbd> Perception <kbd>J</kbd> Field notes
        </p>
        <p>
          <kbd>1</kbd> <kbd>2</kbd> Choose <kbd>Esc</kbd> Close a panel
        </p>
      </div>
    </>
  )
}
