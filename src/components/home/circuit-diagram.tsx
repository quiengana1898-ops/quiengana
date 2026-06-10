// Extraction-circuit diagram (SPEC §7 thesis). Static SVG ported from the
// canonical mockup; labels are proper nouns / Spanish by design (not translated).
export function CircuitDiagram() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <g>
          <circle cx="250" cy="250" r="64" fill="#CE2029" opacity="0.92" />
          <text x="250" y="244" textAnchor="middle" fontFamily="Fraunces" fontStyle="italic" fontWeight="600" fontSize="18" fill="#FAF7EF">
            Puerto Rico
          </text>
          <text x="250" y="266" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="#FAF7EF" letterSpacing="1.5">
            LA COLONIA
          </text>
        </g>
        <g fontFamily="JetBrains Mono" fontSize="10" fill="#6BAACF" letterSpacing="1.5">
          <text x="250" y="60" textAnchor="middle">CONGRESO</text>
          <text x="430" y="158" textAnchor="middle">WALL STREET</text>
          <text x="430" y="350" textAnchor="middle">CORPORACIONES</text>
          <text x="250" y="450" textAnchor="middle">CONTRATISTAS</text>
          <text x="70" y="350" textAnchor="middle">ESTADOS</text>
          <text x="70" y="158" textAnchor="middle">LA JUNTA</text>
        </g>
        <g fill="#FAF7EF" opacity="0.18">
          <circle cx="250" cy="80" r="20" />
          <circle cx="397" cy="178" r="20" />
          <circle cx="397" cy="322" r="20" />
          <circle cx="250" cy="420" r="20" />
          <circle cx="103" cy="322" r="20" />
          <circle cx="103" cy="178" r="20" />
        </g>
        <g stroke="#6BAACF" strokeWidth="1.5" fill="none" opacity="0.55" strokeDasharray="3,3">
          <line x1="250" y1="100" x2="250" y2="190" />
          <line x1="103" y1="198" x2="200" y2="232" />
        </g>
        <g stroke="#CE2029" strokeWidth="2" fill="none" opacity="0.85">
          <line x1="300" y1="232" x2="380" y2="190" markerEnd="url(#arrowred)" />
          <line x1="300" y1="268" x2="380" y2="310" markerEnd="url(#arrowred)" />
          <line x1="250" y1="314" x2="250" y2="402" markerEnd="url(#arrowred)" />
          <line x1="200" y1="268" x2="123" y2="310" markerEnd="url(#arrowred)" />
        </g>
        <defs>
          <marker id="arrowred" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#CE2029" />
          </marker>
        </defs>
        <g fontFamily="JetBrains Mono" fontSize="8" fill="#FAF7EF" opacity="0.6" letterSpacing="1">
          <text x="345" y="200">$$$</text>
          <text x="345" y="298">$$$</text>
          <text x="258" y="365">$$$</text>
          <text x="148" y="298">$$$</text>
          <text x="258" y="158">Rules</text>
          <text x="148" y="200">Veto</text>
        </g>
      </svg>
    </div>
  );
}
