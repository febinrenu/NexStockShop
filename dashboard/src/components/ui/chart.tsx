import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'bar';
  height?: number;
  color?: string;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  type = 'line',
  height = 200,
  color = 'indigo',
}) => {
  if (!data || data.length === 0) return null;
  
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  
  const colorMap = {
    indigo: {
      fill: 'fill-indigo-500/10',
      stroke: 'stroke-indigo-600',
      bar: 'bg-indigo-600 hover:bg-indigo-700',
    },
    violet: {
      fill: 'fill-violet-500/10',
      stroke: 'stroke-violet-600',
      bar: 'bg-violet-600 hover:bg-violet-700',
    },
    emerald: {
      fill: 'fill-emerald-500/10',
      stroke: 'stroke-emerald-600',
      bar: 'bg-emerald-600 hover:bg-emerald-700',
    },
  };

  const selectedColors = colorMap[color as keyof typeof colorMap] || colorMap.indigo;

  if (type === 'bar') {
    return (
      <div className="w-full flex flex-col justify-end" style={{ height }}>
        <div className="flex-1 flex items-stretch justify-between gap-4 px-2 pb-2">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md z-10 whitespace-nowrap">
                  {item.value.toLocaleString()}
                </div>
                {/* Bar wrapper providing resolved height for percentage calculation */}
                <div className="w-full flex-1 flex items-end justify-center">
                  <div 
                    className={`w-full rounded-t transition-all duration-350 ${selectedColors.bar}`}
                    style={{ height: `${percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-medium tracking-wide truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const svgWidth = 500;
  const svgHeight = height;
  const paddingX = 45;
  const paddingY = 25;
  
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, ...item };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = paddingY + chartHeight * p;
          const labelVal = maxValue - p * maxValue;
          return (
            <g key={i} className="opacity-35">
              <line 
                x1={paddingX} 
                y1={y} 
                x2={svgWidth - paddingX} 
                y2={y} 
                stroke="#cbd5e1" 
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text 
                x={paddingX - 10} 
                y={y + 3} 
                textAnchor="end" 
                className="fill-gray-400 text-[10px] font-semibold"
              >
                {Math.round(labelVal).toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={areaD} className={`${selectedColors.fill} transition-all duration-300`} />

        <path 
          d={pathD} 
          fill="none" 
          className={`${selectedColors.stroke} transition-all duration-300`} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4.5" 
              className={`${selectedColors.stroke} fill-white`}
              strokeWidth="2"
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="9" 
              fill="transparent" 
              className="hover:fill-indigo-500/10"
            />
            
            <text 
              x={p.x} 
              y={svgHeight - 6} 
              textAnchor="middle" 
              className="fill-gray-400 text-[9px] font-semibold"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Chart;
