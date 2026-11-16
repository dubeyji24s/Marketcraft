import { forwardRef } from 'react';
import { downloadBlob } from '../lib/download.js';

const W = 1100;
const H = 780;

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Printable, self-contained SVG certificate (no external assets, so it rasterizes cleanly). */
export const Certificate = forwardRef(function Certificate({ cert }, ref) {
  const accent = cert.color || '#ff5da2';
  const gold = cert.tier === 'Distinction';
  const medal = gold ? '#F5B700' : accent;
  const serif = "Georgia, 'Times New Roman', serif";
  const sans = "'Outfit', 'Helvetica Neue', Arial, sans-serif";

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Certificate of Completion for ${cert.recipientName}`}>
      <defs>
        <linearGradient id="band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b0b3a" />
          <stop offset="1" stopColor="#3b1580" />
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor="#ffc83d" />
        </linearGradient>
        <radialGradient id="medal" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff7d1" />
          <stop offset="0.45" stopColor={medal} />
          <stop offset="1" stopColor="#7a4d00" />
        </radialGradient>
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill={accent} opacity="0.18" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill="#fffdf8" />
      <rect width={W} height={H} fill="url(#dots)" />
      <rect x="22" y="22" width={W - 44} height={H - 44} rx="22" fill="none" stroke="url(#band)" strokeWidth="10" />
      <rect x="44" y="44" width={W - 88} height={H - 88} rx="14" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />

      {/* corner bursts */}
      {[[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="16" fill="url(#accent)" />
          <text y="6" textAnchor="middle" fontSize="16" fill="#fff">★</text>
        </g>
      ))}

      <text x={W / 2} y="128" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="22" letterSpacing="8" fill="#3b1580">MARKETCRAFT</text>
      <text x={W / 2} y="196" textAnchor="middle" fontFamily={serif} fontSize="54" fontWeight="700" fill="#1b0b3a">Certificate of Completion</text>
      <rect x={W / 2 - 140} y="214" width="280" height="6" rx="3" fill="url(#accent)" />

      <text x={W / 2} y="276" textAnchor="middle" fontFamily={sans} fontSize="20" fill="#5b5470">This certifies that</text>
      <text x={W / 2} y="350" textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="60" fill="#1b0b3a">{cert.recipientName}</text>
      <line x1={W / 2 - 300} x2={W / 2 + 300} y1="370" y2="370" stroke="#d8d2e6" strokeWidth="2" />

      <text x={W / 2} y="416" textAnchor="middle" fontFamily={sans} fontSize="20" fill="#5b5470">
        {cert.kind === 'ambassador' ? 'has completed the professional Brand Ambassador Mission' : 'has successfully completed the hands-on marketing challenge'}
      </text>
      <text x={W / 2} y="456" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="30" fill="#1b0b3a">“{cert.challengeTitle}”</text>
      <text x={W / 2} y="494" textAnchor="middle" fontFamily={sans} fontSize="18" fill="#5b5470">
        scoring {cert.score}% on the Marketcraft professional rubric — clarity · audience · value · visuals{cert.kind === 'ambassador' ? ' · brand & disclosure' : ''}
      </text>

      {/* badge medal */}
      <g transform={`translate(${W / 2} 586)`}>
        <path d="M -40 30 L -58 100 L -30 86 L -14 108 L 0 40 Z" fill={accent} opacity="0.9" />
        <path d="M 40 30 L 58 100 L 30 86 L 14 108 L 0 40 Z" fill="#3b1580" opacity="0.9" />
        <circle r="66" fill="url(#medal)" stroke="#fff" strokeWidth="5" />
        <circle r="54" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="3 5" />
        <text y="-8" textAnchor="middle" fontFamily={sans} fontWeight="800" fontSize="15" fill="#2a1600">{gold ? 'DISTINCTION' : 'CERTIFIED'}</text>
        <text y="18" textAnchor="middle" fontSize="28">{gold ? '🏆' : '🏅'}</text>
      </g>
      <text x={W / 2} y="722" textAnchor="middle" fontFamily={sans} fontWeight="700" fontSize="18" fill="#3b1580">Badge earned: {cert.badge}</text>

      <g fontFamily={sans} fill="#5b5470" fontSize="16">
        <text x="140" y="620" textAnchor="middle" fontWeight="700" fill="#1b0b3a">{fmtDate(cert.issuedAt)}</text>
        <line x1="60" x2="220" y1="632" y2="632" stroke="#d8d2e6" strokeWidth="2" />
        <text x="140" y="656" textAnchor="middle">Date of completion</text>

        <text x={W - 140} y="620" textAnchor="middle" fontWeight="700" fill="#1b0b3a" fontFamily="monospace">{cert.verifyCode}</text>
        <line x1={W - 220} x2={W - 60} y1="632" y2="632" stroke="#d8d2e6" strokeWidth="2" />
        <text x={W - 140} y="656" textAnchor="middle">Verification code</text>
      </g>
    </svg>
  );
});

/** Rasterize the SVG to a PNG and trigger a download. */
export async function downloadCertificatePng(svgEl, filename) {
  const xml = new XMLSerializer().serializeToString(svgEl);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    await downloadBlob(blob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadCertificateSvg(svgEl, filename) {
  const xml = new XMLSerializer().serializeToString(svgEl);
  return downloadBlob(new Blob([xml], { type: 'image/svg+xml' }), filename);
}
