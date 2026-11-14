import { useEffect, useState } from 'react';
import { useUI } from '../store/ui.js';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-orbit" role="status">
      <div className="rocket" aria-hidden>✦</div>
      <div className="muted">{label}</div>
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="alert alert-error" role="alert">{error.message || String(error)}</div>;
}

export function Toasts() {
  const toasts = useUI((s) => s.toasts);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>{t.message}</div>
      ))}
    </div>
  );
}

export function Modal({ onClose, children, wide, label }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`card modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Celebration() {
  const c = useUI((s) => s.celebration);
  const close = useUI((s) => s.closeCelebration);
  if (!c) return null;
  return (
    <Modal onClose={close} label="Achievement unlocked">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.4rem' }} aria-hidden>🎉</div>
        <h2 className="gradient-text">{c.title || 'Achievement unlocked!'}</h2>
        {c.xp > 0 && <p className="chip chip-brand" style={{ fontSize: '1rem' }}>+{c.xp} XP</p>}
        {c.badges.length > 0 && (
          <div className="grid stagger" style={{ '--min': '130px', margin: '18px 0' }}>
            {c.badges.map((b) => (
              <div key={b.key} className="badge-tile earned">
                <span className="emoji" aria-hidden>{b.emoji}</span>
                <b>{b.label}</b>
                <span className="muted small">{b.description}</span>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-primary" onClick={close} autoFocus>Awesome!</button>
      </div>
    </Modal>
  );
}

export function ScoreRing({ percent, passed, size = 150 }) {
  return (
    <div
      className="ring"
      style={{ '--p': percent, '--c': passed ? 'var(--success)' : 'var(--brand)', width: size }}
      role="img"
      aria-label={`Score ${percent} percent`}
    >
      <div>
        <div>
          <b>{percent}</b>
          <div className="muted small">/ 100</div>
        </div>
      </div>
    </div>
  );
}

/** Very small, safe markdown subset: paragraphs, "- " lists, **bold**. No HTML injection. */
export function MiniMarkdown({ text }) {
  const blocks = String(text || '').split(/\n{2,}/);
  const inline = (s, k) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={`${k}-${i}`}>{part.slice(2, -2)}</strong> : part,
    );
  return blocks.map((block, bi) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
      return (
        <ul key={bi}>
          {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-*•]\s+/, ''), li)}</li>)}
        </ul>
      );
    }
    return <p key={bi}>{lines.map((l, li) => <span key={li}>{inline(l, li)}{li < lines.length - 1 && <br />}</span>)}</p>;
  });
}

export const ROLE_INFO = {
  kid: { label: 'Kid Entrepreneur', emoji: '🧃', blurb: 'Under 18? Learn with a parent\'s account: lemonade stands, crafts, school fairs and more!' },
  adult: { label: 'Adult Business Owner', emoji: '🏪', blurb: 'Grow your shop or side hustle without a big ad budget.' },
  professional: { label: 'Professional', emoji: '📈', blurb: 'Sharpen DTC strategy, measurement and creative.' },
};

export const CHANNEL_INFO = {
  social: { label: 'Social media', emoji: '📱' },
  'digital-ad': { label: 'Digital ad', emoji: '🎯' },
  outdoor: { label: 'Physical / outdoor', emoji: '🪧' },
};

/** Two-step delete/confirm button (browser confirm() dialogs are blocked in some embeds). */
export function ConfirmButton({ onConfirm, children = 'Delete', confirmLabel = 'Yes, delete', className = 'btn btn-sm btn-danger' }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <button type="button" className={className} onClick={() => setAsking(true)}>{children}</button>;
  return (
    <span className="row" style={{ gap: 6 }} role="group" aria-label="Confirm">
      <button type="button" className="btn btn-sm btn-danger" autoFocus onClick={() => { setAsking(false); onConfirm(); }}>{confirmLabel}</button>
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setAsking(false)}>Cancel</button>
    </span>
  );
}
