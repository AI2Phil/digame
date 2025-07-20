import React from 'react';

const TimelineChart = ({ data, width = 600, height = 200, className = '' }) => {
  if (!data || !data.length) {
    return (
      <div className={`timeline-chart ${className}`}>
        <div className="text-center text-gray-500 py-8">
          No timeline data available
        </div>
      </div>
    );
  }
  
  const margin = { top: 20, right: 20, bottom: 40, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const minDate = new Date(Math.min(...data.map(d => new Date(d.date))));
  const maxDate = new Date(Math.max(...data.map(d => new Date(d.date))));
  const timeRange = maxDate - minDate;
  
  return (
    <div className={`timeline-chart ${className}`}>
      <svg width={width} height={height}>
        {/* Timeline line */}
        <line
          x1={margin.left}
          y1={height / 2}
          x2={width - margin.right}
          y2={height / 2}
          stroke="#e5e7eb"
          strokeWidth={2}
        />
        
        {/* Timeline points */}
        {data.map((item, index) => {
          const date = new Date(item.date);
          const x = margin.left + ((date - minDate) / timeRange) * chartWidth;
          const y = height / 2;
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={6}
                fill="rgb(59, 130, 246)"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                className="text-xs text-gray-600"
              >
                {item.label}
              </text>
              <text
                x={x}
                y={y + 25}
                textAnchor="middle"
                className="text-xs text-gray-500"
              >
                {date.toLocaleDateString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TimelineChart;
