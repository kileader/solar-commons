import { useId } from 'react'
import './kite.css'

/** A procedural portrait: replace this asset without changing dialogue or scene state. */
export function Kite({ active = false, compact = false }: { active?: boolean; compact?: boolean }) {
  const id = `kite-${useId().replace(/:/g, '')}`

  return (
    <svg
      className={`kite-portrait${active ? ' kite-active' : ''}${compact ? ' kite-compact' : ''}`}
      viewBox="0 0 240 260"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-shell`}
          x1="73"
          y1="71"
          x2="149"
          y2="175"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#ecfff2" />
          <stop offset=".36" stopColor="#8fead6" />
          <stop offset="1" stopColor="#348f96" />
        </linearGradient>
        <linearGradient
          id={`${id}-wing`}
          x1="37"
          y1="91"
          x2="88"
          y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d2ffe8" />
          <stop offset="1" stopColor="#50979e" />
        </linearGradient>
        <linearGradient
          id={`${id}-gold`}
          x1="99"
          y1="43"
          x2="130"
          y2="226"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff0c4" />
          <stop offset=".5" stopColor="#d6b775" />
          <stop offset="1" stopColor="#a5824c" stopOpacity=".15" />
        </linearGradient>
        <linearGradient
          id={`${id}-thread`}
          x1="43"
          y1="80"
          x2="195"
          y2="175"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#cfffe5" stopOpacity="0" />
          <stop offset=".35" stopColor="#bdf5dc" />
          <stop offset=".8" stopColor="#87dfeb" />
          <stop offset="1" stopColor="#87dfeb" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id={`${id}-light`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(121 117) rotate(90) scale(26 32)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#eeffea" stopOpacity=".75" />
          <stop offset="1" stopColor="#b9ffe9" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="kite-instrument" stroke="#b2e7da" strokeWidth=".6">
        <path d="M46 184v14h14M194 184v14h-14M46 64V50h14M194 64V50h-14" opacity=".25" />
        <path d="M120 19v9M120 229v9M18 124h9M213 124h9" opacity=".45" />
        <path d="M112 239h16M115 243h10" opacity=".3" />
      </g>

      <g className="kite-field" stroke={`url(#${id}-thread)`} strokeWidth=".85">
        <ellipse cx="120" cy="122" rx="95" ry="38" transform="rotate(-28 120 122)" opacity=".38" />
        <path d="M42 74C19 101 47 155 112 173s99-4 87-30" opacity=".28" />
        <path className="kite-signal" d="M42 74C19 101 47 155 112 173s99-4 87-30" />
        <g className="kite-node" fill="#cbffe7" stroke="none">
          <circle cx="43" cy="154" r="2" />
          <circle cx="193" cy="84" r="1.7" />
          <circle cx="190" cy="171" r="1.2" />
        </g>
        <path d="m37 154h-5m11-11v-5M187 84h-5m11-11v-5" opacity=".6" />
      </g>

      <g className="kite-body">
        {/* Dark backing keeps the facets legible over bright, busy landscape art. */}
        <path
          d="m120 42 45 46 42 24-29 45-33-9-25 37-25-37-33 9-29-45 42-24Z"
          fill="#143b42"
          fillOpacity=".95"
        />

        <g className="kite-wings" stroke="#bff3dd" strokeWidth=".8" strokeLinejoin="round">
          <path d="m76 87-43 25 29 45 21-36Z" fill={`url(#${id}-wing)`} fillOpacity=".94" />
          <path d="m76 87-8 37-35-12Z" fill="#e0ffeb" fillOpacity=".6" />
          <path d="m33 112 29 45 6-33Z" fill="#39767e" fillOpacity=".85" />
          <path d="m62 157 21-36-15 3Z" fill="#75c5ba" />
          <path d="m164 87 43 25-29 45-21-36Z" fill={`url(#${id}-shell)`} fillOpacity=".92" />
          <path d="m164 87 8 37 35-12Z" fill="#b9f5d9" fillOpacity=".77" />
          <path d="m207 112-29 45-6-33Z" fill="#367481" fillOpacity=".9" />
          <path d="m178 157-21-36 15 3Z" fill="#73b3ad" />
          <path d="m41 114 22 33M199 114l-22 33" stroke="#fff0c4" strokeOpacity=".65" />
        </g>

        <g className="kite-core" strokeLinejoin="round">
          <path
            d="m120 42 47 65-47 78-47-78Z"
            fill={`url(#${id}-shell)`}
            stroke="#dcffe8"
            strokeWidth="1.2"
          />
          <path d="m120 42 0 72-47-7Z" fill="#d7ffe7" fillOpacity=".85" />
          <path d="m120 42 47 65-47 7Z" fill="#65b8b5" />
          <path d="m73 107 47 7v71Z" fill="#326f79" />
          <path d="m167 107-47 7v71Z" fill="#72d3c7" fillOpacity=".73" />
          <path
            d="m120 42 0 72-47-7M120 114l47-7M120 114v71"
            stroke="#ceffe9"
            strokeWidth=".65"
            strokeOpacity=".67"
          />
          <path
            d="m120 57 34 49-34 57-34-57Z"
            stroke="#e9fff0"
            strokeWidth=".6"
            strokeOpacity=".38"
          />
          <path
            d="m120 79 23 35-23 36-23-36Z"
            fill="#123f46"
            fillOpacity=".88"
            stroke="#b6edd8"
            strokeWidth=".85"
          />
          <path d="m120 81 0 67M98 114h44" stroke="#8fd6c5" strokeWidth=".6" strokeOpacity=".6" />
          <ellipse cx="120" cy="115" rx="32" ry="26" fill={`url(#${id}-light)`} />
          <path
            className="kite-focus"
            d="m105 114 10-2 5 2 5-2 10 2-10 2-5-2-5 2Z"
            fill="#fff1bc"
          />
          <path d="M114 124h12" stroke="#e8d596" strokeWidth="1.25" strokeLinecap="round" />
          <path d="m120 34 3 4-3 4-3-4Z" fill="#fff3c8" />
        </g>

        <g className="kite-ribbons" strokeLinejoin="round">
          <path
            d="m108 167 12 18-10 29 6-22-15-14Z"
            fill={`url(#${id}-gold)`}
            stroke="#eddda1"
            strokeWidth=".6"
            strokeOpacity=".8"
          />
          <path
            d="m133 164-9 23 9 18-4 20-2-19-13-20Z"
            fill="#a3e4d3"
            fillOpacity=".73"
            stroke="#beffdc"
            strokeWidth=".6"
            strokeOpacity=".72"
          />
          <path
            d="m120 184-10 30 0 10M133 205l-4 20"
            stroke={`url(#${id}-gold)`}
            strokeWidth=".7"
          />
        </g>

        <g className="kite-cognition" stroke="#dbffe6" strokeWidth=".7" strokeLinecap="round">
          <path d="m93 74-7-18H65M148 80l12-23h18M86 138l-15 31H51M148 142l15 32h24" />
          <path d="M59 56h-8m131 1h7M46 169h-6m152 5h7" stroke="#ffe9ae" />
          <circle cx="93" cy="74" r="2" fill="#fff5c9" />
          <circle cx="148" cy="80" r="2" fill="#fff5c9" />
          <circle cx="86" cy="138" r="2" fill="#dbffe6" />
          <circle cx="148" cy="142" r="2" fill="#dbffe6" />
        </g>
      </g>
    </svg>
  )
}
