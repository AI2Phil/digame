import React, { useState, useEffect, useRef } from 'react';

const InteractiveChart = ({ 
  data = [], 
  type = 'line', 
  title = 'Interactive Chart',
  height = 300,
  showTooltip = true,
  showLegend = true,
  interactive = true,
  onDataPointClick,
  onZoom,
  colors = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed']
}) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const chartRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sample data if none provided
  const sampleData = data.length > 0 ? data : [
    { label: 'Mon', values: [65, 45, 30] },
    { label: 'Tue', values: [75, 55, 35] },
    { label: 'Wed', values: [85, 65, 40] },
    { label: 'Thu', values: [70, 50, 45] },
    { label: 'Fri', values: [90, 70, 50] },
    { label: 'Sat', values: [60, 40, 25] },
    { label: 'Sun', values: [55, 35, 20] }
  ];

  const chartData = sampleData;
  const maxValue = Math.max(...chartData.flatMap(d => d.values));
  const chartWidth = 400;
  const chartHeight = height - 80; // Account for padding and labels

  // Generate SVG path for line chart
  const generatePath = (values, seriesIndex) => {
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * chartWidth;
      const y = chartHeight - (value / maxValue) * chartHeight;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Handle mouse events
  const handleMouseMove = (event) => {
    if (!interactive) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find closest data point
    const pointIndex = Math.round((x / chartWidth) * (chartData.length - 1));
    if (pointIndex >= 0 && pointIndex < chartData.length) {
      setHoveredPoint({
        index: pointIndex,
        data: chartData[pointIndex],
        x: x,
        y: y
      });
    }

    // Handle dragging for pan
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      setPanOffset({ x: deltaX, y: deltaY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const handleMouseDown = (event) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event) => {
    if (!interactive) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel * delta));
    setZoomLevel(newZoom);
    if (onZoom) onZoom(newZoom);
  };

  const handleDataPointClick = (pointIndex, seriesIndex) => {
    if (onDataPointClick) {
      onDataPointClick(chartData[pointIndex], pointIndex, seriesIndex);
    }
  };

  // Reset zoom and pan
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="interactive-chart-container">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {interactive && (
            <>
              <button
                onClick={resetView}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Reset View
              </button>
              <span className="text-xs text-gray-500">
                Zoom: {Math.round(zoomLevel * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-white rounded-lg border border-gray-200 p-4">
        <svg
          ref={chartRef}
          width={chartWidth + 60}
          height={height}
          className="overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
          }}
        >
          {/* Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

          {/* Y-Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <g key={index}>
              <line
                x1={0}
                y1={chartHeight - ratio * chartHeight}
                x2={chartWidth}
                y2={chartHeight - ratio * chartHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={-10}
                y={chartHeight - ratio * chartHeight + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {Math.round(maxValue * ratio)}
              </text>
            </g>
          ))}

          {/* Data Series */}
          {chartData[0]?.values.map((_, seriesIndex) => {
            const seriesValues = chartData.map(d => d.values[seriesIndex]);
            const color = colors[seriesIndex % colors.length];

            if (type === 'line') {
              return (
                <g key={seriesIndex}>
                  {/* Line */}
                  <path
                    d={generatePath(seriesValues, seriesIndex)}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200 hover:stroke-width-4"
                  />
                  
                  {/* Data Points */}
                  {seriesValues.map((value, pointIndex) => {
                    const x = (pointIndex / (seriesValues.length - 1)) * chartWidth;
                    const y = chartHeight - (value / maxValue) * chartHeight;
                    const isHovered = hoveredPoint?.index === pointIndex;
                    
                    return (
                      <circle
                        key={pointIndex}
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4}
                        fill={color}
                        stroke="white"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200 hover:r-6"
                        onClick={() => handleDataPointClick(pointIndex, seriesIndex)}
                      />
                    );
                  })}
                </g>
              );
            } else if (type === 'bar') {
              const barWidth = chartWidth / chartData.length * 0.8;
              const barSpacing = chartWidth / chartData.length * 0.2;
              
              return (
                <g key={seriesIndex}>
                  {seriesValues.map((value, pointIndex) => {
                    const x = (pointIndex / chartData.length) * chartWidth + barSpacing / 2 + (seriesIndex * barWidth / chartData[0].values.length);
                    const barHeight = (value / maxValue) * chartHeight;
                    const y = chartHeight - barHeight;
                    const color = colors[seriesIndex % colors.length];
                    
                    return (
                      <rect
                        key={pointIndex}
                        x={x}
                        y={y}
                        width={barWidth / chartData[0].values.length}
                        height={barHeight}
                        fill={color}
                        className="cursor-pointer transition-all duration-200 hover:opacity-80"
                        onClick={() => handleDataPointClick(pointIndex, seriesIndex)}
                      />
                    );
                  })}
                </g>
              );
            }
            return null;
          })}

          {/* X-Axis Labels */}
          {chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {item.label}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {showTooltip && hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10"
            style={{
              left: hoveredPoint.x + 10,
              top: hoveredPoint.y - 30,
              transform: 'translate(-50%, 0)'
            }}
          >
            <div className="font-medium">{hoveredPoint.data.label}</div>
            {hoveredPoint.data.values.map((value, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && chartData[0]?.values.length > 1 && (
        <div className="flex items-center justify-center space-x-6 mt-4">
          {chartData[0].values.map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600">Series {index + 1}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart Controls */}
      {interactive && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setZoomLevel(prev => Math.min(3, prev * 1.2))}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Zoom In
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev * 0.8))}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Zoom Out
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Click and drag to pan • Scroll to zoom • Click points for details
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveChart;