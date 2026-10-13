import { useId } from 'react'
import { sceneCopy } from '../content/harbor'

export function Perception({ active }: { active: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`perception-layer ${active ? 'is-active' : ''}`} aria-hidden="true">
      <svg className="perception-geometry" viewBox="0 0 1600 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${id}-flow`}>
            <stop stopColor="#d8ffec" stopOpacity="0" />
            <stop offset=".5" stopColor="#b0fff1" />
            <stop offset="1" stopColor="#d8ffec" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}-field`}>
            <stop stopColor="#4cddd2" stopOpacity=".16" />
            <stop offset="1" stopColor="#4cddd2" stopOpacity="0" />
          </radialGradient>
          <pattern id={`${id}-grid`} width="70" height="70" patternUnits="userSpaceOnUse">
            <path
              d="M 70 0 L 0 0 0 70"
              fill="none"
              stroke="#a8fae9"
              strokeOpacity=".11"
              strokeWidth=".7"
            />
          </pattern>
        </defs>
        <rect width="1600" height="800" fill={`url(#${id}-grid)`} />
        <ellipse cx="1010" cy="472" rx="490" ry="250" fill={`url(#${id}-field)`} />
        <g className="field-contours" fill="none" stroke="#c2ffed" strokeWidth="1" opacity=".42">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <ellipse
              key={n}
              cx="1010"
              cy="472"
              rx={110 + n * 53}
              ry={36 + n * 26}
              transform={`rotate(-13 1010 472)`}
            />
          ))}
          <path d="M150 535 Q350 180 580 300 T1040 235 T1490 190" />
          <path d="M70 615 Q400 285 720 410 T1530 370" />
          <path d="M550 70 Q780 240 850 470 T1340 650" />
        </g>
        <g className="anomaly-wireframe" fill="none" stroke="#e0ffda" strokeWidth="1.3">
          <path d="M844 478 924 414 1055 390 1188 430 1160 499 1036 547 904 531Z" />
          <path d="M844 504 924 440 1055 416 1188 456 1160 525 1036 573 904 557Z" opacity=".5" />
          <path
            d="M844 478v26m80-90v26m131-50v26m133 14v26m-28 43v26m-124 22v26m-132-42v26"
            opacity=".5"
          />
          <ellipse cx="1012" cy="480" rx="77" ry="32" transform="rotate(-13 1012 480)" />
          <path d="M924 414 1036 547m19-157L904 531m284-101L844 478" opacity=".28" />
        </g>
        <g className="connection-flow" fill="none" stroke={`url(#${id}-flow)`} strokeWidth="2">
          <path d="M180 665 C440 600 610 400 1010 472" />
          <path d="M180 665 C480 700 935 240 1310 255" />
          <path d="M580 300 C770 220 790 420 1010 472" />
        </g>
        <g fill="#d4ffde">
          {[
            [580, 300],
            [1010, 472],
            [1310, 255],
            [180, 665],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="4" />
              <circle cx={x} cy={y} r="12" fill="none" stroke="#d4ffde" strokeOpacity=".4" />
            </g>
          ))}
        </g>
        <path
          className="scan-line"
          d="M0 0H1600"
          stroke="#d7ffee"
          strokeOpacity=".3"
          strokeWidth="1"
        />
      </svg>
      <div className="perception-label label-water">
        <span className="tiny-status" />
        OBSERVED · SONAR RETURN<strong>{sceneCopy.perception.observation}</strong>
      </div>
      <div className="perception-label label-model">
        MODELED · GEOMETRY FIT<strong>{sceneCopy.perception.model}</strong>
        <span>{sceneCopy.perception.limitation}</span>
      </div>
      <div className="perception-legend">
        <i />
        Solid · observation <i className="dashed" />
        Dashed · inference
      </div>
      <div className="perception-caption">
        KITE / SHARED SENSORIUM<span>{sceneCopy.perception.caption}</span>
      </div>
    </div>
  )
}
