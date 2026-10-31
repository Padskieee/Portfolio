
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./PacmanNavbar.css";

export default function PacmanNavbar({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="pf-pacman-navbar" aria-hidden="true">
      <DotLottieReact
        src="/Portfolio/Pac-Man-Orange-Grayscale-Pellets.lottie"
        autoplay
        loop
        className="pf-pacman-animation"
      />
    </div>
  );
}
