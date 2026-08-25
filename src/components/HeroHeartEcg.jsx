import { UNIT_PATH } from "./EcgLine";

const HEART_PATH =
  "M150,225 C35,150 5,85 40,45 C68,10 120,12 150,58 C180,12 232,10 260,45 C295,85 265,150 150,225 Z";

function HeroHeartEcg({ className = "" }) {
  return (
    <div className={`hero-heart ${className}`} aria-hidden="true">
      <svg viewBox="0 0 300 235" className="hero-heart__svg">
        <defs>
          <linearGradient id="heartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="100%" stopColor="#7a1626" />
          </linearGradient>
          <clipPath id="heartClip">
            <path d={HEART_PATH} />
          </clipPath>
        </defs>

        <path d={HEART_PATH} fill="url(#heartGrad)" className="hero-heart__shape" />

        <g clipPath="url(#heartClip)">
          <g transform="translate(0,88) scale(0.5)">
            <g className="hero-heart__ecg">
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={UNIT_PATH}
                  transform={`translate(${300 * i},0)`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default HeroHeartEcg;
