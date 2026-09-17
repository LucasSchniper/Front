import cardiologyMark from "../assets/brand/cardiology-mark.png";
import decaWordmark from "../assets/brand/deca-wordmark.png";

export const LOGO_SIZE = 42;

interface LogoProps {
  size?: number;
  pulse?: boolean;
  className?: string;
}

function Logo({ size = LOGO_SIZE, pulse = false, className = "" }: LogoProps) {
  return (
    <span className={`logo ${className}`}>
      <img
        src={cardiologyMark}
        alt=""
        aria-hidden="true"
        className={`logo__mark ${pulse ? "heart-pulse-icon" : ""}`}
        style={{ width: size, height: size }}
      />
      <img
        src={decaWordmark}
        alt="DECA"
        className="logo__word"
        style={{ height: Math.round(size * 0.54) }}
      />
    </span>
  );
}

export default Logo;
