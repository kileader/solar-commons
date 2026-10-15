import { ArrowRight, BookOpen, Waves, X } from 'lucide-react'
import { museumArt } from '../art'
import { floodSnapshot, floodStages, museumContent, type FloodStage } from '../content/museum'
import type { SceneEvent, SceneState } from '../state/scene'
import { Modal } from './Modal'
import './museum.css'

export function RefugeRecord() {
  const record = museumContent.refugeRecord
  return (
    <article className="refuge-record" aria-label={record.heading}>
      <span className="eyebrow">{record.heading}</span>
      <h2>{record.designation}</h2>
      <p>{record.text}</p>
      <small>{record.caption}</small>
    </article>
  )
}

export function HistoryExhibit({ open, onClose }: { open: boolean; onClose: () => void }) {
  const exhibit = museumContent.historicalExhibit
  return (
    <Modal open={open} onClose={onClose} titleId="exhibit-title" className="history-exhibit">
      <div className="modal-topline">
        <span className="eyebrow">
          <BookOpen size={15} /> Permanent collection
        </span>
        <button className="close-button" onClick={onClose} aria-label="Close history exhibit">
          <X size={20} />
        </button>
      </div>
      <img
        className="exhibit-art"
        src={museumArt.exhibit}
        alt="Sunlit flood-history gallery, with a blue flood line and archival displays"
      />
      <h2 id="exhibit-title">{exhibit.title}</h2>
      <p className="exhibit-introduction">{exhibit.introduction}</p>
      <div className="exhibit-text">
        {exhibit.sections.map((section) => (
          <section key={section.title}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      <p className="exhibit-source">{exhibit.source}</p>
      <button className="modal-done" onClick={onClose}>
        Return to the gallery <ArrowRight size={18} />
      </button>
    </Modal>
  )
}

export function FloodReconstruction({
  state,
  perform,
  onReadHistory,
}: {
  state: SceneState
  perform: (event: SceneEvent) => void
  onReadHistory: () => void
}) {
  const snapshot = floodSnapshot(state.floodStage, state.gateOpen)
  const dawn = state.floodStage === 2
  const seaY = 300 - snapshot.seaWater * 200
  const streetY = 300 - snapshot.streetWater * 160
  return (
    <section className="flood-reconstruction" aria-labelledby="model-title">
      <div className="model-titleline">
        <span className="eyebrow">
          <Waves size={16} /> Visitor-operated tide model
        </span>
        <span>TURN THE NIGHT FORWARD</span>
      </div>
      <h2 id="model-title">The Night of Two Waters</h2>
      <div className="model-timeline" role="group" aria-label="Historical moment">
        {floodStages.map((stage, index) => (
          <button
            key={stage}
            className="model-moment"
            aria-pressed={state.floodStage === index}
            onClick={() => perform({ type: 'SET_FLOOD_STAGE', stage: index as FloodStage })}
          >
            <span>0{index + 1}</span>
            {stage}
          </button>
        ))}
      </div>
      <div className="model-layout">
        <div className={`model-cutaway ${dawn ? 'at-dawn' : ''}`}>
          <svg
            viewBox="0 0 800 365"
            role="img"
            aria-label={`Flood cutaway: ${floodStages[state.floodStage]}, sea gate ${state.gateOpen ? 'open' : 'closed'}. ${snapshot.detail}`}
          >
            <defs>
              <linearGradient id="model-water" x2="0" y2="1">
                <stop stopColor="#97dbc9" stopOpacity=".75" />
                <stop offset="1" stopColor="#348d94" stopOpacity=".25" />
              </linearGradient>
              <pattern id="model-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M25 0H0V25" fill="none" stroke="#e4d5a9" strokeOpacity=".08" />
              </pattern>
            </defs>
            <rect width="800" height="365" fill="url(#model-grid)" />
            <path
              d="M15 315H780V105L720 140 665 135 600 205H275V315Z"
              fill="#a48d5d"
              fillOpacity=".27"
              stroke="#dbc28a"
              strokeWidth="2"
            />
            {[315, 375, 435, 495].map((x, index) => (
              <path
                key={x}
                d={`M${x} 205v-43h34v43m-30-43v-13h26v13`}
                fill="#b6a377"
                fillOpacity=".16"
                stroke="#dec797"
                strokeWidth="1.5"
              />
            ))}
            <rect
              className="model-water"
              x="15"
              y={seaY}
              width="242"
              height={315 - seaY}
              fill="url(#model-water)"
            />
            <rect
              className="model-water"
              x="277"
              y={streetY}
              width="321"
              height={315 - streetY}
              fill="url(#model-water)"
            />
            <path d="M265 110V315" stroke="#bca572" strokeWidth="6" />
            <path
              className="model-gate"
              d={state.gateOpen ? 'M265 250L220 280' : 'M265 210V292'}
              stroke="#ffe4a0"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M560 310v-55q0-25 25-25h60q25 0 25 25v55Z"
              fill="#173f3c"
              stroke="#dbc28a"
              strokeWidth="2"
            />
            {[572, 586, 600, 614, 628, 642].map((x) => (
              <path key={x} d={`M${x} 310v-65`} stroke="#dbc28a" strokeOpacity=".5" />
            ))}
            <circle
              className="refuge-lamp"
              cx="615"
              cy="257"
              r="7"
              fill={dawn ? '#ffe6a1' : '#77948a'}
            />
            {state.perception && (
              <g fill="none" stroke="#b3ffdb" strokeDasharray="6 7" strokeWidth="2">
                <path d="M740 135L630 195 540 215" />
                <path d={state.gateOpen ? 'M340 286L210 286' : 'M335 286L290 286 310 268'} />
                <path d="M480 315L585 325 700 220" />
              </g>
            )}
            <g fill="#e3d5af" fontSize="17" fontFamily="Trebuchet MS, sans-serif">
              <text x="42" y="52">
                HARBOR
              </text>
              <text x="318" y="114">
                LOWER STREETS
              </text>
              <text x="661" y="73">
                HILLS
              </text>
              <text x="542" y="348">
                LOWER REFUGE
              </text>
              <text x="193" y="345">
                SEA GATE
              </text>
            </g>
            {state.floodStage === 1 && (
              <path
                d="M735 150L650 200 545 224m0 0 15-18m-15 18 25 2"
                fill="none"
                stroke="#92dccc"
                strokeWidth="3"
              />
            )}
          </svg>
          {dawn && (
            <button className="lamp-discovery" onClick={() => perform({ type: 'INSPECT_LAMP' })}>
              <span aria-hidden="true">✦</span>
              {state.discovered ? 'Review the handover record' : 'The lamp is still lit'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="model-reading" aria-live="polite">
          <span className="eyebrow">
            {dawn ? 'Recorded observation' : 'Illustrated water response'}
          </span>
          <h3>{snapshot.title}</h3>
          <p>{snapshot.detail}</p>
          <button
            className="gate-control"
            disabled={dawn}
            aria-pressed={state.gateOpen}
            onClick={() => perform({ type: 'TOGGLE_GATE' })}
          >
            <span className="wheel" aria-hidden="true">
              ✥
            </span>
            <span>
              Sea gate: {state.gateOpen ? 'open' : 'closed'}
              <small>
                {dawn
                  ? 'Local crews hold control at dawn'
                  : `Turn the wheel to ${state.gateOpen ? 'close' : 'open'} it`}
              </small>
            </span>
          </button>
        </div>
      </div>
      <p className="model-footnote">
        A teaching reconstruction. Water levels illustrate competing pressures; the lamp comes from
        a reproduced handover log.
      </p>
      <div className="museum-actions model-actions">
        <button className="text-action" onClick={() => perform({ type: 'LEAVE_MODEL' })}>
          Leave the model for now <ArrowRight size={17} />
        </button>
        <button className="text-action" onClick={onReadHistory}>
          <BookOpen size={17} /> Read the history wall
        </button>
      </div>
    </section>
  )
}
