/** Original harbor schematics, kept visible while the evidence text is paged. */
export function EvidenceDiagram({ kind, label }: { kind: string; label: string }) {
  return (
    <svg className="evidence-diagram" viewBox="0 0 400 105" role="img" aria-label={label}>
      <defs>
        <pattern id={`diagram-${kind}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" opacity=".1" />
        </pattern>
      </defs>
      <rect width="400" height="105" fill={`url(#diagram-${kind})`} />
      {kind === 'geometry' ? (
        <g fill="none" stroke="currentColor">
          <path d="M90 68 155 28 285 28 320 54 255 85 120 85Z" strokeDasharray="5 4" opacity=".6" />
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <path
              key={n}
              d={`M${115 + n * 23} ${64 - n * 3}l65-33v21l-65 33Z`}
              opacity={0.4 + n * 0.1}
            />
          ))}
        </g>
      ) : kind === 'thermal' ? (
        <g fill="none" stroke="currentColor">
          <path
            d="M0 72Q50 70 80 73T135 71 190 68 220 43 247 51 270 69 320 71 400 71"
            strokeWidth="2"
          />
          <path d="M0 76H400" strokeDasharray="4 5" opacity=".35" />
          <ellipse cx="231" cy="57" rx="42" ry="27" strokeDasharray="3 4" opacity=".5" />
        </g>
      ) : (
        <g fill="none" stroke="currentColor">
          <path d="M30 32H370M30 59H370" opacity=".5" />
          <path d="M30 77H370" strokeDasharray="4 6" opacity=".4" />
          <path d="M60 32v27m55-27v27m55-27v27m55-27v27m55-27v27m55-27v27" opacity=".5" />
          <path d="m178 79 22-13 23 13-23 13Z" strokeDasharray="3 3" />
        </g>
      )}
    </svg>
  )
}
