import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { IconMenu, IconClose } from "./icons/Icons";

const LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#chagas", label: "Sobre Chagas" },
  { href: "#datos", label: "Datos clave" },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <div className="container site-header__row">
        <a href="#inicio" className="site-header__brand" onClick={() => setOpen(false)}>
          <Logo pulse />
        </a>

        <nav className={`site-header__nav ${open ? "site-header__nav--open" : ""}`}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <div className="site-header__auth site-header__auth--mobile">
            <Link to="/login" className="btn btn--outline-light" onClick={() => setOpen(false)}>
              Log in
            </Link>
            <Link to="/signup" className="btn btn--light" onClick={() => setOpen(false)}>
              Sign up
            </Link>
          </div>
        </nav>

        <div className="site-header__auth">
          <Link to="/login" className="btn btn--outline-light btn--sm">
            Log in
          </Link>
          <Link to="/signup" className="btn btn--light btn--sm">
            Sign up
          </Link>
        </div>

        <button
          className="site-header__burger"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </header>
  );
}

export default Header;
