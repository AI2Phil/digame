import React from 'react';

const SankeyChart = ({ data, width = 400, height = 300, className = '' }) => {
  // Simple sankey diagram placeholder
  return (
    <div className={`sankey-chart ${className}`}>
      <svg width={width} height={height}>
        <text x={width/2} y={height/2} textAnchor="middle" className="text-gray-500">
          Sankey Chart
        </text>
        <text x={width/2} y={height/2 + 20} textAnchor="middle" className="text-sm text-gray-400">
          {data?.nodes?.length || 0} nodes, {data?.links?.length || 0} links
        </text>
      </svg>
    </div>
  );
};

export default SankeyChart;
