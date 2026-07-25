export default function GraphCanvas({ nodes, edges, edgeLabels, onSelect }) {
  return (
    <>
      <div className="graph-canvas card">
        <svg viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
          {edges.map((e, i) => (
            <line
              key={i}
              className="edge-line"
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={e.stroke}
              strokeDasharray={e.dashed ? '4 4' : undefined}
            />
          ))}

          {edgeLabels.map((l, i) => (
            <text key={i} x={l.x} y={l.y} className="node-label" fill={l.color} fontSize="10">{l.text}</text>
          ))}

          {nodes.map((node) => (
            <g key={node.id} onClick={() => onSelect(node.id)}>
              <circle className="node-circle" cx={node.cx} cy={node.cy} r={node.r} fill={node.fill} />
              <text
                x={node.cx}
                y={node.cy + node.labelDy}
                textAnchor="middle"
                className="node-label"
                fill={node.labelColor}
                fontWeight="700"
                fontSize={node.labelSize}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="graph-legend card" style={{ marginTop: '14px' }}>
        <span><span className="legend-dot" style={{ background: '#D98C3D' }}></span>Romantic / rivalry</span>
        <span><span className="legend-dot" style={{ background: '#7A93B0' }}></span>Mentorship</span>
        <span><span className="legend-dot" style={{ background: '#D9534F' }}></span>Protective / conflict</span>
        <span style={{ marginLeft: 'auto', color: 'var(--c-text-dim)' }}>Node size = story prominence</span>
      </div>
    </>
  );
}
