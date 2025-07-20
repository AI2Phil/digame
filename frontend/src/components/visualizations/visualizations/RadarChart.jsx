import React from 'react';

const RadarChart = ({ data, width = 300, height = 300, className = '' }) => {
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width, height) / 2 - 20;
  
  if (!data || !data.length) {
    return (
      <div className={`radar-chart ${className}`}>
        <svg width={width} height={height}>
          <text x={center.x} y={center.y} textAnchor="middle" className="text-gray-500">
            No data available
          </text>
        </svg>
      </div>
    );
  }
  
  const angleStep = (2 * Math.PI) / data.length;
  
  return (
    <div className={`radar-chart ${className}`}>
      <svg width={width} height={height}>
        {/* Grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <circle
            key={scale}
            cx={center.x}
            cy={center.y}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
        
        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = center.x + Math.cos(angle) * radius;
          const y = center.y + Math.sin(angle) * radius;
          
          return (
            <line
              key={index}
              x1={center.x}
              y1={center.y}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Data polygon */}
        <polygon
          points={data.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const value = item.value || 0;
            const x = center.x + Math.cos(angle) * radius * value;
            const y = center.y + Math.sin(angle) * radius * value;
            return `${x},${y}`;
          }).join(' ')}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="rgb(59, 130, 246)"
          strokeWidth={2}
        />
        
        {/* Labels */}
        {data.map((item, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x = center.x + Math.cos(angle) * (radius + 15);
          const y = center.y + Math.sin(angle) * (radius + 15);
          
          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              className="text-xs text-gray-600"
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
