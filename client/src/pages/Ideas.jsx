// Idea Board (kids) / Business Canvas (grown-ups): build your own business idea step by step,
// visually, with autosave, a money slider and a downloadable poster.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { IDEA_STEPS, ideaProgress } from '@play';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ConfirmButton, ErrorBox, Loading } from '../components/common.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { announcePlay } from '../lib/play.js';
import { Icon, IconTile } from '../components/Icon.jsx';
import { downloadBlob, safeName } from '../lib/download.js';

const EMOJIS = ['💡', '🍋', '🍪', '🧁', '🎨', '📚', '🐶', '🌱', '⚽', '🎮', '🧶', '💍', '🕯️', '🧼', '📸', '🎵', '🚲', '🧹', '💻', '🍕', '👕', '🌸', '🧸', '🚀'];
const COLORS = ['#7c5cff', '#ff5f8f', '#00c9a7', '#ff7a59', '#3d7bff', '#f59e0b', '#10b981', '#e11d48'];
const WHO = {
  kid: ['Friends', 'Neighbours', 'Classmates', 'Families', 'Pet owners', 'Grown-ups', 'Teachers', 'Gamers'],
  grown: ['Local families', 'Busy professionals', 'Students', 'Small businesses', 'Gift shoppers', 'Seniors', 'Parents', 'Pet owners'],
};
const SPARKS = {
  kid: ['It\'s handmade by me', 'It\'s more fun', 'It\'s faster', 'It\'s kinder to the planet', 'Nobody nearby does it', 'It\'s a great price'],
  grown: ['Higher quality', 'Faster or more convenient', 'Lower price', 'Better service', 'Unique or handmade', 'Local and personal'],
};
const CHANNELS = [
  { id: 'Poster', icon: 'image', tone: 'orange', tip: 'Big name, one picture, price and where to find you.' },
  { id: 'Word of mouth', icon: 'users', tone: 'pink', tip: 'Ask happy customers: "Know anyone else who\'d like this?"' },
  { id: 'Short video', icon: 'studio', tone: 'violet', tip: 'Hook in the first 3 seconds, show the product, end with what to do.' },
  { id: 'School or local fair', icon: 'tent', tone: 'amber', tip: 'Clear prices, products at different heights, a sign-up sheet.' },
  { id: 'Social media', icon: 'phone', tone: 'blue', tip: 'Under 18? Post from a parent\'s account, with their OK.' },
  { id: 'Email list', icon: 'mail', tone: 'teal', tip: 'Only email people who said yes, and make it easy to unsubscribe.' },
  { id: 'Google Business Profile', icon: 'search', tone: 'green', tip: 'Free listing so people nearby can find you on Search and Maps.' },
  { id: 'Partner with a shop', icon: 'ambassador', tone: 'cyan', tip: 'Team up with a nearby business that has the same customers.' },
];
const blank = () => ({ emoji: '💡', color: COLORS[0], name: '', what: '', who: [], whoText: '', special: '', cost: '', price: '', channels: [], slogan: '', picture: '' });
const money = (n) => (Number.isFinite(n) ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }) : '–');

export default function Ideas() {
  const user = useAuth((s) => s.user);
  const kid = user?.role === 'kid';
  const { data, error, loading, setData } = useApi('/play/ideas');
  const [activeId, setActiveId] = useState(null);
  const toast = useUI((s) => s.toast);
  const ideas = data?.ideas ?? [];
  const active = ideas.find((i) => i.id === activeId) ?? null;

  async function create() {
    try {
      const r = await api.post('/play/ideas', blank());
      setData((d) => ({ ideas: [r.idea, ...(d?.ideas ?? [])] }));
      setActiveId(r.idea.id);
    } catch (e) {
      toast(e.message, 'error');
    }
  }
  const replace = (idea) => setData((d) => ({ ideas: (d?.ideas ?? []).map((x) => (x.id === idea.id ? idea : x)) }));

  if (error) return <ErrorBox error={error} />;
  if (loading) return <Loading />;

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header>
        <h1 className="title-with-icon"><IconTile name="ideas" tone="amber" size={44} /> {kid ? 'My Idea Board' : 'Business Canvas'}</h1>
        <p className="muted">
          {kid
            ? 'Dream up a business, then build it one fun step at a time. Everything saves by itself, and only you can see it.'
            : 'Map out a business or product idea in six short steps: customer, edge, price, channels and pitch. Autosaves and stays private.'}
        </p>
      </header>

      {!active && (
        <div className="idea-wall">
          <button type="button" className="idea-note idea-new" onClick={create}>
            <span className="idea-note-emoji" aria-hidden>＋</span>
            <b>{kid ? 'New idea' : 'New canvas'}</b>
          </button>
          {ideas.map((i, n) => (
            <button type="button" key={i.id} className="idea-note" style={{ '--note': i.color, '--tilt': `${(n % 3) - 1}deg` }} onClick={() => setActiveId(i.id)}>
              <span className="idea-note-emoji" aria-hidden>{i.emoji}</span>
              <b>{i.name || 'Untitled idea'}</b>
              <span className="small">{i.progress.done}/{i.progress.total} steps</span>
              <span className="idea-dots" aria-hidden>{i.progress.steps.map((s) => <i key={s.id} className={s.done ? 'on' : ''} />)}</span>
            </button>
          ))}
        </div>
      )}
      {!active && ideas.length === 0 && (
        <p className="muted small">{kid ? 'Not sure what to make? Think about something your friends always ask for, or a chore you could help neighbours with.' : 'Tip: start with a problem you\'ve seen customers complain about.'}</p>
      )}

      {active && <IdeaEditor key={active.id} idea={active} kid={kid} onSaved={replace} onClose={() => setActiveId(null)}
        onDelete={async () => { await api.del(`/play/ideas/${active.id}`); setData((d) => ({ ideas: d.ideas.filter((x) => x.id !== active.id) })); setActiveId(null); }} />}
    </div>
  );
}

function IdeaEditor({ idea: initial, kid, onSaved, onClose, onDelete }) {
  const [idea, setIdea] = useState(initial);
  const [step, setStep] = useState(() => Math.min(ideaProgress(initial).steps.findIndex((s) => !s.done) === -1 ? 5 : ideaProgress(initial).steps.findIndex((s) => !s.done), 5));
  const [saveState, setSaveState] = useState('saved');
  const celebrate = useUI((s) => s.celebrate);
  const toast = useUI((s) => s.toast);
  const refresh = useAuth((s) => s.refresh);
  const timer = useRef(null);
  const latest = useRef(idea);
  const progress = useMemo(() => ideaProgress(idea), [idea]);

  function update(patch) {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setIdea(next);
    setSaveState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(save, 900);
  }
  async function save() {
    timer.current = null;
    const { id, progress: _p, awarded: _a, userId: _u, createdAt: _c, updatedAt: _up, ...body } = latest.current;
    try {
      const r = await api.put(`/play/ideas/${id}`, body);
      setSaveState('saved');
      onSaved(r.idea);
      if (r.xpEarned) {
        celebrate({ badges: r.newBadges, xp: r.xpEarned, title: r.newBadges?.length ? 'Your idea is ready! 💡' : undefined });
        announcePlay(r.play);
        refresh();
      }
    } catch (e) {
      setSaveState('error');
      toast(e.message, 'error');
    }
  }
  useEffect(() => () => { if (timer.current) { clearTimeout(timer.current); save(); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const S = IDEA_STEPS[step];
  return (
    <section className="card idea-editor" style={{ '--note': idea.color }}>
      <div className="row spread">
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>← All {kid ? 'ideas' : 'canvases'}</button>
        <span className={`small save-state ${saveState}`} aria-live="polite">{saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Not saved' : '✓ Saved'}</span>
      </div>

      <ol className="idea-path" aria-label="Steps">
        {IDEA_STEPS.map((s, i) => (
          <li key={s.id}>
            <button type="button" className={`idea-step ${i === step ? 'current' : ''} ${progress.steps[i].done ? 'done' : ''}`} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}>
              <span className="idea-step-dot" aria-hidden><Icon name={progress.steps[i].done ? 'check' : s.icon} size={20} /></span>
              <span className="idea-step-label">{kid ? s.kid : s.grown}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="idea-body">
        <div className="stack" style={{ '--gap': '14px' }}>
          <h2 className="title-with-icon" style={{ margin: 0 }}><IconTile name={S.icon} tone={['violet', 'pink', 'amber', 'green', 'orange', 'teal'][step]} size={40} /> {kid ? S.kid : S.grown}</h2>

          {S.id === 'dream' && (
            <>
              <label className="field"><span>{kid ? 'Give your business a name' : 'Business or product name'}</span>
                <input value={idea.name} maxLength={60} onChange={(e) => update({ name: e.target.value })} placeholder={kid ? 'e.g. Lemon Zoom' : 'e.g. Bright Scarves Co.'} /></label>
              <label className="field"><span>{kid ? 'What will you sell or do?' : 'What do you sell, in one or two sentences?'}</span>
                <textarea rows={3} value={idea.what} maxLength={300} onChange={(e) => update({ what: e.target.value })} placeholder={kid ? 'e.g. Fresh lemonade on my street on Saturdays' : 'e.g. Hand-knitted scarves in small seasonal batches'} /></label>
              <div className="field"><span>Pick an emoji</span>
                <div className="emoji-grid" role="radiogroup" aria-label="Emoji">
                  {EMOJIS.map((e) => <button type="button" key={e} role="radio" aria-checked={idea.emoji === e} className={idea.emoji === e ? 'on' : ''} onClick={() => update({ emoji: e })}>{e}</button>)}
                </div>
              </div>
              <div className="field"><span>Pick a colour</span>
                <div className="color-row" role="radiogroup" aria-label="Colour">
                  {COLORS.map((c) => <button type="button" key={c} role="radio" aria-checked={idea.color === c} aria-label={c} className={idea.color === c ? 'on' : ''} style={{ background: c }} onClick={() => update({ color: c })} />)}
                </div>
              </div>
            </>
          )}

          {S.id === 'who' && (
            <>
              <p className="muted" style={{ margin: 0 }}>{kid ? 'Who would love this? Tap everyone who fits.' : 'Who is your first, most likely customer? Be specific.'}</p>
              <ChipPicker options={WHO[kid ? 'kid' : 'grown']} value={idea.who} onChange={(who) => update({ who })} />
              <label className="field"><span>{kid ? 'Anyone else?' : 'Describe them (age, place, what they care about)'}</span>
                <input value={idea.whoText} maxLength={200} onChange={(e) => update({ whoText: e.target.value })} placeholder={kid ? 'e.g. People walking their dogs' : 'e.g. Parents in our town who shop for gifts online'} /></label>
              <Link className="small" to="/app/learn">Learn more: "Find Your First 100 Fans"</Link>
            </>
          )}

          {S.id === 'special' && (
            <>
              <p className="muted" style={{ margin: 0 }}>{kid ? 'Why would someone pick YOU? Tap a spark for ideas.' : 'Why would a customer choose you over the alternatives?'}</p>
              <div className="chips-wrap">
                {SPARKS[kid ? 'kid' : 'grown'].map((s) => (
                  <button type="button" key={s} className="chip-btn" onClick={() => update({ special: idea.special ? `${idea.special.replace(/[.\s]*$/, '')}. ${s}.` : `${s}.` })}><Icon name="sparkles" size={14} /> {s}</button>
                ))}
              </div>
              <textarea rows={4} aria-label="What makes it special" value={idea.special} maxLength={300} onChange={(e) => update({ special: e.target.value })} placeholder={kid ? 'e.g. I use real lemons and add a mint leaf' : 'e.g. Delivered in 24 hours, locally made, gift-wrapped free'} />
            </>
          )}

          {S.id === 'money' && <MoneyStep idea={idea} kid={kid} update={update} />}

          {S.id === 'spread' && (
            <>
              <p className="muted" style={{ margin: 0 }}>{kid ? 'How will people find out? Pick 1–3 to start.' : 'Pick 2–3 channels where your customers already are.'}</p>
              <div className="channel-grid">
                {CHANNELS.map((c) => {
                  const on = idea.channels.includes(c.id);
                  return (
                    <button type="button" key={c.id} className={`channel ${on ? 'on' : ''}`} aria-pressed={on}
                      onClick={() => update({ channels: on ? idea.channels.filter((x) => x !== c.id) : [...idea.channels, c.id] })}>
                      <IconTile name={c.icon} tone={c.tone} size={38} />
                      <b>{c.id}</b>
                      {on && <span className="small">{c.tip}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {S.id === 'poster' && <PosterStep idea={idea} kid={kid} update={update} />}

          <div className="row spread" style={{ marginTop: 6 }}>
            <button type="button" className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            {step < IDEA_STEPS.length - 1
              ? <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>Next step →</button>
              : <Link className="btn btn-primary" to="/app/studio">Practise the pitch →</Link>}
          </div>
        </div>

        <aside className="idea-preview-wrap" aria-label="Live preview">
          <Poster idea={idea} />
          <p className="small muted" style={{ textAlign: 'center' }}>{progress.done}/{progress.total} steps done · +10 XP for each new step</p>
        </aside>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <ConfirmButton onConfirm={onDelete} confirmLabel="Yes, delete this idea">Delete idea</ConfirmButton>
      </div>
    </section>
  );
}

function ChipPicker({ options, value, onChange }) {
  return (
    <div className="chips-wrap">
      {options.map((o) => {
        const on = value.includes(o);
        return <button type="button" key={o} className={`chip-btn ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}>{on ? '✓ ' : ''}{o}</button>;
      })}
    </div>
  );
}

function MoneyStep({ idea, kid, update }) {
  const cost = idea.cost === '' ? NaN : Number(idea.cost);
  const price = idea.price === '' ? NaN : Number(idea.price);
  const profit = price - cost;
  const max = Math.max(10, Math.ceil((Number.isFinite(price) ? price : 0) * 2));
  const num = (v) => (v === '' ? '' : Math.max(0, Math.round(Number(v) * 100) / 100));
  const ten = profit * 10;
  return (
    <>
      <p className="muted" style={{ margin: 0 }}>{kid ? 'Let\'s do the money maths! Ask a grown-up to help you add up what things cost.' : 'Set a price that covers every cost per item (materials, packaging, fees, your time).'}</p>
      <div className="money-row">
        <label className="field"><span>{kid ? 'It costs me (per item)' : 'Cost per item'}</span>
          <input type="number" inputMode="decimal" min="0" step="0.05" value={idea.cost} onChange={(e) => update({ cost: num(e.target.value) })} placeholder="0.50" /></label>
        <label className="field"><span>{kid ? 'I will sell it for' : 'Price'}</span>
          <input type="number" inputMode="decimal" min="0" step="0.05" value={idea.price} onChange={(e) => update({ price: num(e.target.value) })} placeholder="2.00" /></label>
      </div>
      <input type="range" min="0" max={max} step="0.25" value={Number.isFinite(price) ? price : 0} onChange={(e) => update({ price: Number(e.target.value) })} aria-label="Price slider" className="price-slider" />
      {Number.isFinite(profit) && (
        <div className={`money-result ${profit > 0 ? 'good' : 'bad'}`}>
          {profit > 0 ? (
            <>
              <b>{kid ? `You keep ${money(profit)} for every one you sell! 🎉` : `Profit per sale: ${money(profit)} (${Math.round((profit / price) * 100)}% margin)`}</b>
              <div className="coins" aria-hidden>{Array.from({ length: Math.min(10, Math.max(1, Math.round(ten / Math.max(price, 1)))) }, (_, k) => <span key={k} className="coin"><Icon name="coins" size={16} /></span>)}</div>
              <span className="small">{kid ? `Sell 10 → you earn ${money(ten)}` : `10 sales = ${money(ten)} profit · 100 sales = ${money(profit * 100)}`}</span>
            </>
          ) : (
            <b>{kid ? 'Uh-oh: you\'d lose money on each one. Try a higher price or cheaper supplies.' : 'Your price doesn\'t cover your cost. Raise the price or cut costs.'}</b>
          )}
        </div>
      )}
    </>
  );
}

async function shrinkImage(file, maxSide = 640) {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
}

function PosterStep({ idea, kid, update }) {
  const toast = useUI((s) => s.toast);
  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return toast('Choose a PNG, JPG or WebP picture.', 'error');
    try { update({ picture: await shrinkImage(f) }); } catch { toast('That picture could not be opened.', 'error'); }
  }
  return (
    <>
      <label className="field"><span>{kid ? 'Your catchy slogan' : 'One-line pitch'}</span>
        <input value={idea.slogan} maxLength={120} onChange={(e) => update({ slogan: e.target.value })} placeholder={kid ? 'e.g. Zoom into summer!' : 'e.g. Cozy, handmade, made to last.'} /></label>
      <div className="row">
        <label className="btn btn-sm"><Icon name="camera" size={16} /> {idea.picture ? 'Change picture' : 'Add a picture'}
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} hidden /></label>
        {idea.picture && <button type="button" className="btn btn-sm btn-ghost" onClick={() => update({ picture: '' })}>Remove picture</button>}
        <button type="button" className="btn btn-sm btn-primary" onClick={() => downloadPoster(idea)}><Icon name="share" size={16} /> Download poster</button>
      </div>
      {kid && <p className="small muted" style={{ margin: 0 }}><Icon name="shield" size={14} /> Don't put your address, school or phone number on posters you share online.</p>}
    </>
  );
}

function Poster({ idea }) {
  const price = idea.price === '' ? null : Number(idea.price);
  return (
    <div className="idea-poster" style={{ '--note': idea.color }}>
      {idea.picture ? <img src={idea.picture} alt="" className="idea-poster-img" /> : <div className="idea-poster-emoji" aria-hidden>{idea.emoji}</div>}
      <h3>{idea.name || 'Your business name'}</h3>
      <p>{idea.slogan || idea.what || 'Your slogan goes here'}</p>
      {price > 0 && <span className="idea-poster-price">{money(price)}</span>}
      {idea.channels.length > 0 && <span className="small" style={{ opacity: 0.85 }}>{idea.channels.slice(0, 3).join(' · ')}</span>}
    </div>
  );
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxWidth && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

async function downloadPoster(idea) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, idea.color);
  g.addColorStop(1, '#14112b');
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  x.textAlign = 'center';
  x.fillStyle = '#fff';
  let y = 140;
  if (idea.picture) {
    const img = new Image();
    img.src = idea.picture;
    await img.decode().catch(() => {});
    const side = 560;
    const s = Math.max(side / img.width, side / img.height);
    x.save();
    x.beginPath();
    x.roundRect((W - side) / 2, y, side, side, 48);
    x.clip();
    x.drawImage(img, (W - img.width * s) / 2, y + (side - img.height * s) / 2, img.width * s, img.height * s);
    x.restore();
    y += side + 110;
  } else {
    x.font = '320px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    x.fillText(idea.emoji, W / 2, y + 300);
    y += 460;
  }
  x.font = '800 92px Outfit, system-ui, sans-serif';
  for (const l of wrap(x, idea.name || 'My business', W - 140).slice(0, 2)) { x.fillText(l, W / 2, y); y += 100; }
  x.font = '500 50px Outfit, system-ui, sans-serif';
  y += 10;
  for (const l of wrap(x, idea.slogan || idea.what || '', W - 160).slice(0, 3)) { x.fillText(l, W / 2, y); y += 64; }
  if (Number(idea.price) > 0) {
    x.font = '800 70px Outfit, system-ui, sans-serif';
    x.fillStyle = '#ffe066';
    x.fillText(money(Number(idea.price)), W / 2, Math.min(y + 90, H - 120));
  }
  x.fillStyle = 'rgba(255,255,255,0.6)';
  x.font = '500 30px Outfit, system-ui, sans-serif';
  x.fillText('Made with Marketcraft', W / 2, H - 50);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  await downloadBlob(blob, `${safeName(idea.name || 'my-idea')}-poster.png`);
}
