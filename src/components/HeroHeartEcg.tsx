import heartEcgIcon from "../assets/brand/medical-icon_i-cardiologyG.png";

function HeroHeartEcg({ className = "" }: { className?: string }) {
  return (
    <div className={`hero-heart ${className}`} aria-hidden="true">
      <img src={heartEcgIcon} alt="" className="hero-heart__img" />
    </div>
  );
}

export default HeroHeartEcg;
