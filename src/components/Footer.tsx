import { Link } from "react-router-dom";
import EcgLine from "./EcgLine";
import Logo from "./Logo";

const NAVEGACION = [
  { href: "#inicio", label: "Inicio" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#chagas", label: "Sobre Chagas" },
  { href: "#datos", label: "Datos clave" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <EcgLine color="#fff" height={40} className="site-footer__ecg" />

      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo className="logo--on-dark" />
          <p className="site-footer__tagline">
            Detección de Chagas asistida por inteligencia artificial, pensada
            para acompañar al equipo de salud y no para reemplazarlo.
          </p>
        </div>

        <nav className="site-footer__cols" aria-label="Enlaces del pie de página">
          <div className="site-footer__col">
            <h3>Navegación</h3>
            <ul>
              {NAVEGACION.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__col">
            <h3>Plataforma</h3>
            <ul>
              <li>
                <Link to="/signup">Crear cuenta</Link>
              </li>
              <li>
                <Link to="/login">Iniciar sesión</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h3>Contacto</h3>
            <ul>
              <li>
                <a href="mailto:deca@gmail.com">deca@gmail.com</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-row">
          <p>© {year} DECA. Todos los derechos reservados.</p>
          <p className="site-footer__disclaimer">
            Herramienta de apoyo al diagnóstico: no reemplaza la consulta médica
            ni las pruebas serológicas.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
