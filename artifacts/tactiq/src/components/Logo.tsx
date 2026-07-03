import tactiqIcon from "../assets/tactiq-icon.png";
import tactiqFullLogo from "../assets/tactiq-logo-full.png";

interface LogoIconProps {
  className?: string;
  alt?: string;
}

export function LogoIcon({ className = "w-8 h-8", alt = "TactIQ" }: LogoIconProps) {
  return (
    <img
      src={tactiqIcon}
      alt={alt}
      className={`object-contain shrink-0 ${className}`}
      draggable={false}
    />
  );
}

interface LogoFullProps {
  className?: string;
  alt?: string;
}

export function LogoFull({ className = "h-8", alt = "TactIQ — Smarter Tactics. Better Teams." }: LogoFullProps) {
  return (
    <img
      src={tactiqFullLogo}
      alt={alt}
      className={`object-contain shrink-0 ${className}`}
      draggable={false}
    />
  );
}
