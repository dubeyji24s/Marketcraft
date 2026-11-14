import { Link } from 'react-router-dom';

export const APP_NAME = 'Marketcraft';

/**
 * Animated, multi-colour Marketcraft logo mark: a stylised "M" whose right stroke rises
 * like a growth chart. The tile cycles through the brand rainbow, the strokes draw in on
 * load, the arrow bobs upward and a sparkle twinkles. All motion respects
 * prefers-reduced-motion (see styles.css).
 */
export function LogoMark({ size = 38, animated = true }) {
  return (
    <span className={`logo-mark ${animated ? 'is-animated' : ''}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66} className="logo-glyph">
        <path className="logo-stroke s1" d="M5 25V9l7 9 6-7" pathLength="1" />
        <path className="logo-stroke s2" d="M18 18v7M24 15v10" pathLength="1" />
        <g className="logo-arrow">
          <path className="logo-stroke s3" d="M18 11l9-6M27 5v6M27 5h-6" pathLength="1" />
        </g>
      </svg>
      <span className="logo-spark" />
    </span>
  );
}

export function Brand({ to = '/', compact = false, style }) {
  return (
    <Link to={to} className="brand" style={style} aria-label={`${APP_NAME} home`}>
      <LogoMark />
      <span className="brand-text">
        <span className="brand-word">Marketcraft</span>
        {!compact && <span className="brand-sub">Marketing course</span>}
      </span>
    </Link>
  );
}
