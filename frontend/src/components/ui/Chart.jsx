import React from "react";
import { cn } from "../../lib/utils";

export function Chart({
  className,
  data,
  labels,
  height = 200,
  lineColor = "#3b82f6",
  secondaryData,
  secondaryLineColor = "#10b981",
  ...props
}) {
  // Finding the min/max for better scaling
  const allData = [...data, ...(secondaryData || [])];
  const minValue = Math.min(...allData);
  const maxValue = Math.max(...allData);
  const range = maxValue - minValue;

  // Create the points for the SVG polyline for main data
  const width = 100; // Use percentage for responsive scaling
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    // Normalize to 0-100 range for viewBox
    const normalizedValue = range === 0 
      ? 50 // If all values are the same, center it
      : 100 - ((value - minValue) / range) * 80 - 10; // Leave 10% padding on top and bottom
    return `${x},${normalizedValue}`;
  }).join(" ");

  // Create the points for secondary data if it exists
  const secondaryPoints = secondaryData?.map((value, index) => {
    const x = (index / (secondaryData.length - 1)) * width;
    const normalizedValue = range === 0
      ? 50
      : 100 - ((value - minValue) / range) * 80 - 10;
    return `${x},${normalizedValue}`;
  }).join(" ");

  return (
    <div
      className={cn("w-full", className)}
      style={{ height: `${height}px` }}
      {...props}
    >
      <div className="h-full w-full">
        {/* Chart X and Y axes labels */}
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* Y-Axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
            <div>100%</div>
            <div>75%</div>
            <div>50%</div>
            <div>25%</div>
            <div>0%</div>
          </div>
          
          {/* Main chart area with grid lines */}
          <div className="absolute left-8 right-0 top-0 bottom-6 border-b border-gray-200">
            {/* Horizontal grid lines */}
            <div className="absolute left-0 bottom-0 w-full h-full">
              <div className="absolute left-0 bottom-0 w-full border-b border-gray-200"></div>
              <div className="absolute left-0 bottom-1/4 w-full border-b border-dashed border-gray-200"></div>
              <div className="absolute left-0 bottom-2/4 w-full border-b border-dashed border-gray-200"></div>
              <div className="absolute left-0 bottom-3/4 w-full border-b border-dashed border-gray-200"></div>
              
              {/* Actual chart lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Main data line */}
                <polyline 
                  points={points}
                  fill="none" 
                  stroke={lineColor}
                  strokeWidth="2"
                />
                
                {/* Secondary data line if provided */}
                {secondaryPoints && (
                  <polyline 
                    points={secondaryPoints}
                    fill="none" 
                    stroke={secondaryLineColor}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
              </svg>
            </div>
          </div>
          
          {/* X-Axis labels */}
          {labels && (
            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-xs text-gray-400">
              {labels.map((label, index) => (
                <div key={index}>{label}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple skeleton component for loading states
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}