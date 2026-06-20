import React, { useState, useRef, useMemo } from 'react';

/**
 * Helper to compute grid guidelines & coordinate mappings
 */
const getScaledPoints = (data, width, height, padding) => {
  if (!data || data.length === 0) return [];
  const minX = padding;
  const maxX = width - padding;
  const minY = height - padding;
  const maxY = padding;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 10); // avoid div by 0, default max to 10
  const minVal = Math.min(...values, 0); // start y-axis at min or 0

  const valueRange = maxVal - minVal;

  return data.map((d, index) => {
    const ratioX = data.length > 1 ? index / (data.length - 1) : 0.5;
    const x = minX + ratioX * (maxX - minX);
    
    const ratioY = valueRange > 0 ? (d.value - minVal) / valueRange : 0.5;
    const y = minY - ratioY * (minY - maxY);

    return { x, y, value: d.value, label: d.label, raw: d };
  });
};

/**
 * 1. Line Chart Component
 */
export const LineChart = ({ data = [], height = 220, strokeColor = 'var(--accent-blue)', fillGradientId = 'blueGrad' }) => {
  const containerRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(500);

  // Resize listener equivalent (simple hook to get container width)
  React.useEffect(() => {
    if (containerRef.current) {
      const handleResize = () => {
        setContainerWidth(containerRef.current.clientWidth);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const padding = 30;
  const chartHeight = height;

  const scaledPoints = useMemo(() => {
    return getScaledPoints(data, containerWidth, chartHeight, padding);
  }, [data, containerWidth, chartHeight]);

  // Generate SVG Path
  const linePath = useMemo(() => {
    if (scaledPoints.length === 0) return '';
    return scaledPoints.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');
  }, [scaledPoints]);

  // Generate Area Path (closed polygon at bottom)
  const areaPath = useMemo(() => {
    if (scaledPoints.length === 0) return '';
    const first = scaledPoints[0];
    const last = scaledPoints[scaledPoints.length - 1];
    const baselineY = chartHeight - padding;
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [scaledPoints, linePath, chartHeight]);

  const handleMouseMove = (e) => {
    if (scaledPoints.length === 0 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Find the closest point based on X coordinate
    let closest = scaledPoints[0];
    let minDiff = Math.abs(scaledPoints[0].x - mouseX);

    for (let i = 1; i < scaledPoints.length; i++) {
      const diff = Math.abs(scaledPoints[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = scaledPoints[i];
      }
    }

    setHoveredPoint(closest);
    setTooltipPos({
      x: closest.x,
      y: closest.y
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Horizontal Grid Lines
  const gridLines = useMemo(() => {
    const lines = [];
    const step = (chartHeight - 2 * padding) / 4;
    for (let i = 0; i <= 4; i++) {
      lines.push(padding + i * step);
    }
    return lines;
  }, [chartHeight]);

  return (
    <div 
      className="chart-container" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ height }}
    >
      <svg className="chart-svg">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {gridLines.map((y, idx) => (
          <line 
            key={idx} 
            x1={padding} 
            y1={y} 
            x2={containerWidth - padding} 
            y2={y} 
            className="chart-grid-line" 
          />
        ))}

        {/* Chart Line and Area */}
        {scaledPoints.length > 0 && (
          <>
            <path d={areaPath} fill={`url(#${fillGradientId})`} className="chart-area" />
            <path d={linePath} stroke={strokeColor} className="chart-line" fill="none" />
          </>
        )}

        {/* Active hover vertical indicator line */}
        {hoveredPoint && (
          <line
            x1={hoveredPoint.x}
            y1={padding}
            x2={hoveredPoint.x}
            y2={chartHeight - padding}
            stroke="var(--border-color-hover)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        )}

        {/* Nodes / Dots */}
        {scaledPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint && hoveredPoint.x === p.x ? 6 : 4}
            fill={hoveredPoint && hoveredPoint.x === p.x ? 'var(--bg-secondary)' : strokeColor}
            stroke={strokeColor}
            className="chart-point"
          />
        ))}

        {/* X-Axis Labels (first, middle, last for clean spacing) */}
        {scaledPoints.length > 1 && (
          <>
            <text x={scaledPoints[0].x} y={chartHeight - 10} fill="var(--text-muted)" fontSize="10" textAnchor="start">
              {scaledPoints[0].label}
            </text>
            <text x={scaledPoints[Math.floor(scaledPoints.length / 2)].x} y={chartHeight - 10} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {scaledPoints[Math.floor(scaledPoints.length / 2)].label}
            </text>
            <text x={scaledPoints[scaledPoints.length - 1].x} y={chartHeight - 10} fill="var(--text-muted)" fontSize="10" textAnchor="end">
              {scaledPoints[scaledPoints.length - 1].label}
            </text>
          </>
        )}
      </svg>

      {/* HTML Tooltip overlay */}
      {hoveredPoint && (
        <div 
          className="chart-tooltip" 
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px` 
          }}
        >
          <div className="chart-tooltip-title">{hoveredPoint.label}</div>
          <div className="chart-tooltip-value">{hoveredPoint.value}</div>
        </div>
      )}
    </div>
  );
};

/**
 * 2. Bar Chart Component
 */
export const BarChart = ({ data = [], height = 220, barColor = 'var(--accent-cyan)' }) => {
  const containerRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [containerWidth, setContainerWidth] = useState(500);

  React.useEffect(() => {
    if (containerRef.current) {
      const handleResize = () => setContainerWidth(containerRef.current.clientWidth);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const padding = 30;
  const chartHeight = height;
  
  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const valRange = maxVal - minVal;

  const barWidth = useMemo(() => {
    const plotWidth = containerWidth - 2 * padding;
    const gapRatio = 0.3; // gap size relative to bar size
    return data.length > 0 ? (plotWidth / data.length) * (1 - gapRatio) : 10;
  }, [data, containerWidth]);

  const bars = useMemo(() => {
    const plotWidth = containerWidth - 2 * padding;
    const plotHeight = chartHeight - 2 * padding;
    const colWidth = data.length > 0 ? plotWidth / data.length : 10;

    return data.map((d, i) => {
      const ratio = valRange > 0 ? d.value / valRange : 0.5;
      const barHeight = ratio * plotHeight;
      const x = padding + i * colWidth + (colWidth - barWidth) / 2;
      const y = chartHeight - padding - barHeight;

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: d.value,
        label: d.label,
        raw: d
      };
    });
  }, [data, containerWidth, chartHeight, barWidth, valRange]);

  const handleMouseMove = (e, bar) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = bar.x + bar.width / 2;
    const y = bar.y;
    setHoveredBar(bar);
    setTooltipPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  return (
    <div className="chart-container" ref={containerRef} style={{ height }}>
      <svg className="chart-svg">
        {/* Horizontal grid lines */}
        {[0, 1, 2, 3, 4].map((idx) => {
          const y = padding + (idx * (chartHeight - 2 * padding)) / 4;
          return (
            <line 
              key={idx} 
              x1={padding} 
              y1={y} 
              x2={containerWidth - padding} 
              y2={y} 
              className="chart-grid-line" 
            />
          );
        })}

        {/* Bars */}
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={Math.max(bar.height, 2)} // minimum 2px height for visual feedback
            fill={barColor}
            rx="3"
            className="chart-bar"
            style={{ fill: hoveredBar && hoveredBar.label === bar.label ? 'var(--accent-blue)' : barColor }}
            onMouseMove={(e) => handleMouseMove(e, bar)}
            onMouseLeave={handleMouseLeave}
          />
        ))}

        {/* Labels (Shows first, mid, last bar label for layout cleanliness) */}
        {bars.length > 1 && (
          <>
            <text x={bars[0].x + bars[0].width/2} y={chartHeight - 10} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {bars[0].label}
            </text>
            <text x={bars[Math.floor(bars.length / 2)].x + bars[Math.floor(bars.length / 2)].width/2} y={chartHeight - 10} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {bars[Math.floor(bars.length / 2)].label}
            </text>
            <text x={bars[bars.length - 1].x + bars[bars.length - 1].width/2} y={chartHeight - 10} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
              {bars[bars.length - 1].label}
            </text>
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredBar && (
        <div 
          className="chart-tooltip" 
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px` 
          }}
        >
          <div className="chart-tooltip-title">{hoveredBar.label}</div>
          <div className="chart-tooltip-value">{hoveredBar.value}</div>
        </div>
      )}
    </div>
  );
};

/**
 * 3. Radial Progress Indicator
 */
export const RadialProgress = ({ percentage = 0, size = 110, strokeWidth = 10, strokeColor = 'var(--accent-blue)' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="health-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Track circle */}
        <circle
          stroke="var(--border-color)"
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        {/* Fill circle */}
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ 
            transition: 'stroke-dashoffset 0.8s ease-out'
          }}
        />
      </svg>
      <div className="gauge-label">
        <span className="gauge-value">{Math.round(percentage)}</span>
        <span className="gauge-unit">%</span>
      </div>
    </div>
  );
};
