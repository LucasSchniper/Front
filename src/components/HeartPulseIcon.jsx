function HeartPulseIcon({ size = 36, color = "#ffffff" }) {
  return (
    <svg
      className="heart-pulse-icon"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="heart-pulse-icon__heart"
        d="M24 41s-14.6-8.9-19.5-18.4C1.4 16.7 3.5 9.7 9.9 7.6c4-1.3 8.2.3 10.6 3.6l3.5 4.8 3.5-4.8c2.4-3.3 6.6-4.9 10.6-3.6 6.4 2.1 8.5 9.1 5.4 15C38.6 32.1 24 41 24 41z"
        fill={color}
        opacity="0.18"
      />
      <path
        d="M4 25h7l3-7 5 15 4-11 3 6h18"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default HeartPulseIcon;
