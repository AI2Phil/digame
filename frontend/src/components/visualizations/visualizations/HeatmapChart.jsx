import React from 'react';

const HeatmapChart = ({ data, width = 400, height = 300, className = '' }) => {
  // Simple heatmap implementation
  const maxValue = Math.max(...data.flat());
  const cellSize = Math.min(width / data[0].length, height / data.length);
  
  return (
    <div className={`heatmap-chart ${className}`}>
      <svg width={width} height={height}>
        {data.map((row, y) =>
          row.map((value, x) => (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={`rgba(59, 130, 246, ${value / maxValue})`}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))
        )}
      </svg>
    </div>
  );
};

export default HeatmapChart;
