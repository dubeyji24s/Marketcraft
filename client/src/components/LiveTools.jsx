// Hands-on mini tools that live inside lessons: learners play with the idea instead of reading about it.
import { useMemo, useState } from 'react';
import { Icon } from './Icon.jsx';

export const LESSON_TOOLS = {
  'pricing-for-profit': 'profit',
  'first-ad-budget': 'profit',
  'words-that-get-read': 'headline',
  'call-to-action': 'cta',
  'test-and-improve': 'abtest',
  'track-what-works': 'abtest',
};
export const TOOL_TITLES = { profit: 'Profit playground', headline: 'Headline checker', cta: 'Call-to-action checker', abtest: 'Luck or real? A/B simulator' };

export function LiveTool({ kind, kid }) {
  if (kind === 'profit') return <ProfitTool kid={kid} />;
  if (kind === 'headline') return <CopyChecker mode="headline" />;
  if (kind === 'cta') return <CopyChecker mode="cta" />;
  if (kind === 'abtest') return <ABTool />;
  return null;
}

const money = (n) => (Number.isFinite(n) ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '–');

function Slider({ label, value, min, max, step, onChange, fmt = money }) {
  return (
    <label className="tool-slider">
      <span><b>{label}</b><output>{fmt(value)}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function ProfitTool({ kid }) {
  const [cost, setCost] = useState(6);
  const [price, setPrice] = useState(16);
  const [fixed, setFixed] = useState(200);
  const margin = price - cost;
  const breakEven = margin > 0 ? Math.ceil(fixed / margin) : Infinity;
  const at50 = 50 * margin - fixed;
  return (
    <div className="live-tool">
      <Slider label={kid ? 'It costs me' : 'Cost per item'} value={cost} min={0} max={40} step={0.5} onChange={setCost} />
      <Slider label={kid ? 'I sell it for' : 'Price'} value={price} min={0} max={60} step={0.5} onChange={setPrice} />
      <Slider label={kid ? 'Monthly costs (stall, tools…)' : 'Fixed costs per month'} value={fixed} min={0} max={1000} step={10} onChange={setFixed} />
      <div className={`tool-result ${margin > 0 ? 'good' : 'bad'}`}>
        {margin > 0 ? (
          <>
            <div className="tool-big">{breakEven} <small>sales to break even</small></div>
            <div className="tool-bar"><span style={{ width: `${Math.min(100, (breakEven / 100) * 100)}%` }} /></div>
            <p>Each sale earns {money(margin)}. Selling 50 a month {at50 >= 0 ? `makes ${money(at50)} profit` : `still loses ${money(-at50)}`}.</p>
          </>
        ) : (
          <p><b>Every sale loses money.</b> Raise the price or lower the cost.</p>
        )}
      </div>
    </div>
  );
}

const HYPE = /\b(best ever|amazing|incredible|unbelievable|world'?s best|#1|guaranteed)\b|!!/i;
const WEAK_START = /^(welcome|we |we're|our |hi|hello|click here|introducing)/i;
const VERBS = /^(get|book|try|join|grab|order|shop|start|claim|visit|download|reserve|save|learn|see|find|discover|sign up|call|reply)\b/i;
const BENEFIT = /\b(free|save|fast|easy|fresh|in \d+|minutes?|today|delivered|handmade|local|new|guide|tips?|you|your)\b/i;

function CopyChecker({ mode }) {
  const [text, setText] = useState(mode === 'cta' ? 'Click here' : 'Welcome to our amazing bakery!!!');
  const checks = useMemo(() => {
    const t = text.trim();
    const words = t.split(/\s+/).filter(Boolean);
    const list = mode === 'cta'
      ? [
          ['Starts with an action verb (Get, Book, Try…)', VERBS.test(t)],
          ['Says what people get ("your free sample")', BENEFIT.test(t) && !/^click here$/i.test(t)],
          ['Short: 2–6 words', words.length >= 2 && words.length <= 6],
          ['No fake urgency or hype', !HYPE.test(t)],
        ]
      : [
          ['Most important words first (not "Welcome…")', t.length > 0 && !WEAK_START.test(t)],
          ['Has a clear benefit or specific detail', BENEFIT.test(t) || /\d/.test(t)],
          ['Short enough to scan (under 60 characters)', t.length > 0 && t.length <= 60],
          ['No hype words or !!!', !HYPE.test(t)],
        ];
    return list;
  }, [text, mode]);
  const score = checks.filter(([, ok]) => ok).length;
  return (
    <div className="live-tool">
      <label className="field" style={{ marginBottom: 10 }}>
        <span>{mode === 'cta' ? 'Type a button or call to action' : 'Type a headline'}</span>
        <input type="text" value={text} maxLength={120} onChange={(e) => setText(e.target.value)} />
      </label>
      <div className="tool-meter" aria-label={`Score ${score} of 4`}>{[0, 1, 2, 3].map((i) => <span key={i} className={i < score ? 'on' : ''} />)}</div>
      <ul className="tool-checks">
        {checks.map(([label, ok]) => <li key={label} className={ok ? 'ok' : ''}><Icon name={ok ? 'check' : 'question'} size={16} /> {label}</li>)}
      </ul>
      <p className="small" style={{ margin: 0, opacity: 0.85 }}>Try: {mode === 'cta' ? '"Get your free sample"' : '"Fresh cookies delivered in 30 minutes"'}</p>
    </div>
  );
}

function ABTool() {
  const [n, setN] = useState(40);
  const [runs, setRuns] = useState([]);
  const RATE = 0.1; // both versions are secretly identical
  function run() {
    const sim = () => Array.from({ length: n }, () => Math.random() < RATE).filter(Boolean).length;
    setRuns((r) => [{ a: sim(), b: sim(), n }, ...r].slice(0, 5));
  }
  const last = runs[0];
  return (
    <div className="live-tool">
      <p className="small" style={{ margin: 0 }}>Secret: versions A and B are <b>exactly the same</b> (each converts 10% of people). Watch what luck does.</p>
      <Slider label="People who see each version" value={n} min={20} max={2000} step={20} onChange={setN} fmt={(v) => v.toLocaleString()} />
      <button type="button" className="swipe-pill" onClick={run}><Icon name="zap" size={16} /> Run the test</button>
      {last && (
        <div className="tool-result">
          {['a', 'b'].map((k) => (
            <div key={k} className="ab-row">
              <b>{k.toUpperCase()}</b>
              <div className="tool-bar"><span style={{ width: `${Math.min(100, (last[k] / last.n) * 500)}%` }} /></div>
              <span>{last[k]} ({((last[k] / last.n) * 100).toFixed(1)}%)</span>
            </div>
          ))}
          <p>
            {Math.abs(last.a - last.b) / last.n > 0.03
              ? 'Looks like a "winner"… but they\'re identical! That gap is pure luck. Try more people.'
              : 'Close results: with enough people, luck evens out.'}
          </p>
        </div>
      )}
    </div>
  );
}
