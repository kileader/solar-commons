import { useId } from 'react'
import { ScanEye, Crosshair } from 'lucide-react'
import type { CognitiveTrace, CognitiveView as View } from '../content/cognition'

/** Deliberately diagrammatic: luminous contours show attention, not a hidden sensor measurement. */
export function CognitiveSketch({ view, stretch = false }: { view: View; stretch?: boolean }) {
  const id = `attention-${useId().replace(/:/g, '')}`
  return (
    <svg
      className="cognitive-sketch"
      viewBox="0 0 1000 500"
      preserveAspectRatio={stretch ? 'none' : 'xMidYMid meet'}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={id}>
          <stop stopColor="#7effe0" stopOpacity=".2" />
          <stop offset="1" stopColor="#7effe0" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-mesh`} width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" stroke="currentColor" strokeOpacity=".13" />
        </pattern>
      </defs>
      <rect width="1000" height="500" fill={`url(#${id}-mesh)`} />
      <ellipse cx="500" cy="280" rx="450" ry="220" fill={`url(#${id})`} />
      {view.kind === 'museum' ? (
        <>
          <g className="cognitive-contours" stroke="currentColor">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${90 + i * 180} 380V160q70-175 140 0v220M${100 + i * 180} 380V160q60-145 120 0v220`}
                opacity=".6"
              />
            ))}
            <path
              d="M40 330H960M80 390H920M160 450 500 250 840 450M320 450 500 250 680 450"
              opacity=".45"
            />
          </g>
          <g className="cognitive-water-path" stroke="currentColor" strokeWidth="3">
            <path d="M60 350C160 285 240 400 350 340S520 300 600 350" />
            <path d="m450 335 35-15-8 35" />
          </g>
          <g stroke="#f5ca82" strokeWidth="2" strokeDasharray="8 9">
            <path d="M920 180C800 240 790 330 600 350M600 350V430H400" />
            <path d="m820 260-32 9 7-29" />
          </g>
          <path d="m350 350 150-80 200 80-150 90Z" stroke="currentColor" strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`m${370 + i * 28} ${352 + i * 10} 145-80 28 10-145 80Z`}
              stroke="currentColor"
              opacity=".55"
            />
          ))}
        </>
      ) : view.kind === 'canal' ? (
        <>
          <g stroke="currentColor" className="cognitive-contours">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${60 + i * 195} 300V${60 + (i % 2) * 40}h115V300m-95-165h25v35h-25m50-35h25v35h-25m-50 50h25v35h-25m50-35h25v35h-25`}
                opacity=".6"
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M70 ${330 + i * 38}Q500 ${260 + i * 45} 930 ${330 + i * 38}`}
                opacity={0.6 - i * 0.12}
              />
            ))}
            <path d="M260 300q240-200 480 0M260 315q240-200 480 0M380 236v65m120-100v83m120-48v65" />
          </g>
          <path
            className="cognitive-water-path"
            d="M500 490C360 410 650 355 500 280S270 245 250 155"
            stroke="#f5ca82"
            strokeWidth="3"
            strokeDasharray="6 10"
          />
        </>
      ) : (
        <>
          <g stroke="currentColor" className="cognitive-contours">
            <path d="m80 310 330-110 480 105-310 145ZM80 310v40l500 140 310-145v-40M410 200v-40l480 105v40M120 305l460 125 265-119" />
            <path d="M120 230V85h260v145M650 210V70h270v140" opacity=".6" />
          </g>
          <g transform="translate(150 105)" stroke="currentColor" strokeWidth="2">
            {Array.from({ length: 32 }, (_, i) => {
              const h = 5 + ((i * 13) % 31)
              return (
                <path
                  key={i}
                  d={`M${i * 6} ${45 - h}v${h * 2}`}
                  opacity={i > 14 && i < 20 ? 0.15 : 0.9}
                />
              )
            })}
          </g>
          <g stroke="#f5ca82" strokeWidth="2" strokeDasharray="5 7">
            <path d="M240 265v50l110 30 85-35v-50l-110-25Z" />
            <ellipse cx="337" cy="320" rx="100" ry="45" />
          </g>
          <g stroke="currentColor" strokeWidth="2">
            <circle cx="710" cy="120" r="24" />
            <circle cx="855" cy="120" r="24" />
            <path
              className="cognitive-channel"
              d="M735 112H830M735 128H830"
              strokeDasharray={view.connected ? undefined : '5 8'}
            />
            <path d="M780 132v50h55" strokeDasharray="3 8" opacity=".5" />
            <path d="m839 175 14 14m0-14-14 14" stroke="#f5ca82" />
          </g>
          <g fill="currentColor" fontSize="13" fontFamily="monospace">
            <text x="670" y="65">
              {view.connected ? 'PUBLIC AVATAR + VOICE' : 'GUEST LINK · PENDING'}
            </text>
            <text x="720" y="205" fill="#f5ca82">
              PRIVATE · CLOSED
            </text>
          </g>
        </>
      )}
      <g stroke="currentColor" strokeWidth="2">
        <path d="M35 80V35h45M920 35h45v45M35 420v45h45M920 465h45v-45" />
        {[
          [240, 300],
          [500, 260],
          [790, 320],
        ].map(([x, y]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="8" />
            <circle className="cognitive-reticle" cx={x} cy={y} r="22" strokeDasharray="10 5" />
            <path d={`M${x - 32} ${y}h12m40 0h12M${x} ${y - 32}v12m0 40v12`} />
          </g>
        ))}
      </g>
      <path
        className="cognitive-sweep"
        d="M25 250H975"
        stroke="currentColor"
        strokeWidth="2"
        opacity=".5"
      />
    </svg>
  )
}

export function CognitiveLayer({
  view,
  onInspect,
}: {
  view: View
  onInspect: (trace: CognitiveTrace) => void
}) {
  return (
    <div className={`cognitive-scene cognitive-${view.kind}`} aria-label="Shared perception traces">
      <CognitiveSketch view={view} stretch />
      <div className="cognitive-caption">
        <ScanEye size={15} />
        <span>
          KITE / SHARED ATTENTION<strong>{view.title}</strong>
        </span>
        <small>Sketch · not a measurement</small>
      </div>
      <div className="cognitive-traces">
        {view.traces.map((trace, i) => (
          <button
            className="cognitive-focus"
            key={trace.id}
            onClick={() => onInspect(trace)}
            aria-label={`Inspect ${trace.title}`}
          >
            <Crosshair size={17} />
            <span>
              <small>0{i + 1} / FOCUS</small>
              {trace.title}
            </span>
          </button>
        ))}
      </div>
      <button
        className="cognitive-focus cognitive-compact-focus"
        onClick={() => onInspect(view.traces[0])}
        aria-label="Inspect shared traces"
      >
        <ScanEye size={17} /> Shared traces <span>03</span>
      </button>
    </div>
  )
}
