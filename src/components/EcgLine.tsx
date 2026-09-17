export const UNIT_PATH =
  "M0,50 L28,50 L38,50 L46,20 L54,80 L62,12 L70,58 L78,50 L96,50 L106,38 L114,62 L122,50 L300,50";

const UNIT_RATIO = 3;
const COVER_WIDTH = 3200;

export const ECG_SPEED = 76;

const ECG_OPACITY = 0.4;

function EcgLine({
  color = "var(--maroon)",
  height = 70,
  duration,
  opacity = ECG_OPACITY,
  reverse = false,
  className = "",
}) {
  const unit = Math.round(height * UNIT_RATIO);
  const copies = Math.ceil(COVER_WIDTH / unit) + 1;
  const seconds = duration ?? unit / ECG_SPEED;

  return (
    <div
      className={`ecg-line ${className}`}
      style={{ height, opacity, "--ecg-unit": `${unit}px` }}
      aria-hidden="true"
    >
      <svg
        className="ecg-line__track"
        viewBox={`0 0 ${300 * copies} 100`}
        preserveAspectRatio="none"
        style={{
          width: unit * copies,
          animationDuration: `${seconds}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {Array.from({ length: copies }, (_, i) => (
          <path
            key={i}
            d={UNIT_PATH}
            transform={`translate(${300 * i},0)`}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}

export default EcgLine;
