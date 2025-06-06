export function ChartSkeleton() {
  return (
    <g>
      {/* Y축 스켈레톤 */}
      <g transform="translate(0, 20)">
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i} transform={`translate(0, ${i * 60})`}>
            <rect width="48" height="16" rx="2" fill="#E2E8F0" />
          </g>
        ))}
      </g>

      {/* X축 스켈레톤 */}
      <g transform="translate(60, 370)">
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i} transform={`translate(${i * 200}, 0)`}>
            <rect width="64" height="16" rx="2" fill="#E2E8F0" />
          </g>
        ))}
      </g>

      {/* 차트 라인 스켈레톤 */}
      <g transform="translate(60, 20)">
        {/* 격자 라인 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 70}
            x2="900"
            y2={i * 70}
            stroke="#E2E8F0"
            strokeDasharray="2,2"
            opacity="0.1"
          />
        ))}

        {/* 차트 라인 */}
        <path
          d="M0,280 Q200,100 400,200 T800,150"
          stroke="#E2E8F0"
          strokeWidth="2"
          fill="none"
        />

        {/* 데이터 포인트 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <circle
            key={i}
            cx={i * 160}
            cy={150 + Math.sin(i) * 50}
            r="6"
            fill="#E2E8F0"
          />
        ))}
      </g>
    </g>
  );
}
