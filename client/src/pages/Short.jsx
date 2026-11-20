// Shorts player: an auto-playing, narrated, animated "video" made from a lesson.
// Tap right = next, tap left = back, press and hold = pause. Optional free original beat.
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading } from '../components/common.jsx';
import { Icon, IconTile, TONE_ORDER } from '../components/Icon.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { buildShort, speakSlide, SHORT_BEAT } from '../lib/shorts.js';
import { speech, announcePlay } from '../lib/play.js';
import { previewBeat } from '../lib/beats.js';
import { trackFor } from '@course';

const PREF = 'mc-short-prefs';
const loadPrefs = () => { try { return { voice: true, music: true, ...JSON.parse(localStorage.getItem(PREF) || '{}') }; } catch { return { voice: true, music: true }; } };

export default function Short() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const day = Number(params.get('day')) || null;
  const project = params.get('p') || '';
  const { data, error, loading } = useApi(`/lessons/${id}`);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const track = trackFor(user?.role);
  const slides = useMemo(() => (data ? buildShort(data.lesson, { track, project }) : []), [data, track, project]);

  const [state, setState] = useState('ready'); // ready | playing | paused | done
  const [i, setI] = useState(0);
  const [prefs, setPrefs] = useState(loadPrefs);
  const timer = useRef(null);
  const stopBeat = useRef(null);
  const holdTimer = useRef(null);
  const marked = useRef(false);

  const savePrefs = (p) => { setPrefs(p); try { localStorage.setItem(PREF, JSON.stringify(p)); } catch { /* ignore */ } };

  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => { document.body.classList.remove('no-scroll'); speech.stop(); stopBeat.current?.(); clearTimeout(timer.current); };
  }, []);

  // play the current slide: narrate it (if on) and move on when it ends
  useEffect(() => {
    clearTimeout(timer.current);
    if (state !== 'playing' || !slides[i]) return undefined;
    const s = slides[i];
    const next = () => (i + 1 < slides.length ? setI(i + 1) : finish());
    if (prefs.voice && speech.supported) {
      const u = new SpeechSynthesisUtterance(speakSlide(s));
      u.rate = track === 'kid' ? 0.95 : 1.02;
      let moved = false;
      const go = () => { if (!moved) { moved = true; timer.current = setTimeout(next, 450); } };
      u.onend = go;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      timer.current = setTimeout(go, (s.seconds + 6) * 1000); // safety net if the voice never ends
    } else {
      timer.current = setTimeout(next, s.seconds * 1000);
    }
    return () => clearTimeout(timer.current);
  }, [i, state]); // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    setI(0);
    setState('playing');
    if (prefs.music) {
      stopBeat.current?.();
      const total = slides.reduce((a, s) => a + s.seconds, 0) + 20;
      try { stopBeat.current = previewBeat(SHORT_BEAT[track], total, 0.22); } catch { /* audio unavailable */ }
    }
  }
  async function finish() {
    setState('done');
    speech.stop();
    stopBeat.current?.();
    if (day && !marked.current) {
      marked.current = true;
      try {
        const r = await api.post(`/play/course/${day}/step`, { step: 'short' });
        useUI.getState().toast('Short watched ✓', 'success');
        if (r.dayFinished) useUI.getState().celebrate({ badges: r.newBadges ?? [], xp: r.xpEarned, title: `Day ${day} complete!` });
        announcePlay(r.play);
      } catch { /* not in the course or already done */ }
    }
  }
  function jump(d) {
    speech.stop();
    const n = i + d;
    if (n < 0) return;
    if (n >= slides.length) return finish();
    setI(n);
    if (state !== 'playing') setState('playing');
  }
  function onPointerDown() {
    holdTimer.current = setTimeout(() => { setState('paused'); speech.stop(); clearTimeout(timer.current); }, 350);
  }
  function onPointerUp(e) {
    const wasHold = state === 'paused';
    clearTimeout(holdTimer.current);
    if (wasHold) { setState('playing'); return; }
    if (state !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    jump(e.clientX - rect.left < rect.width * 0.33 ? -1 : 1);
  }

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  const s = slides[i];
  const back = day ? '/app/course' : `/app/learn/${id}`;

  return (
    <div className={`short short-${track}`} role="dialog" aria-modal="true" aria-label={`${data.lesson.title}: short`}>
      <div className="short-frame" style={{ '--tone': `var(--t-${TONE_ORDER[i % TONE_ORDER.length]})` }}>
        <div className="short-top">
          <div className="short-bars" aria-hidden>
            {slides.map((sl, k) => (
              <span key={k} className={k < i || state === 'done' ? 'full' : ''}>
                {k === i && state !== 'done' && state !== 'ready' && <i style={{ animationDuration: `${sl.seconds}s`, animationPlayState: state === 'paused' ? 'paused' : 'running' }} />}
              </span>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
            <Link to={back} className="swipe-btn" aria-label="Close"><Icon name="close" size={20} /></Link>
            <span className="row" style={{ gap: 8 }}>
              <button type="button" className={`swipe-btn ${prefs.voice ? 'on' : ''}`} aria-pressed={prefs.voice} onClick={() => { savePrefs({ ...prefs, voice: !prefs.voice }); speech.stop(); }} title="Narrator voice">
                <Icon name={prefs.voice ? 'volume' : 'mute'} size={20} /><span className="sr-only">Narrator voice</span>
              </button>
              <button type="button" className={`swipe-btn ${prefs.music ? 'on' : ''}`} aria-pressed={prefs.music} onClick={() => { const m = !prefs.music; savePrefs({ ...prefs, music: m }); if (!m) stopBeat.current?.(); }} title="Background beat">
                <Icon name="sparkles" size={20} /><span className="sr-only">Background beat</span>
              </button>
            </span>
          </div>
        </div>

        {state === 'ready' && (
          <div className="short-start">
            <IconTile name={slides[0].icon} tone="violet" size={110} className="short-icon" />
            <span className="swipe-chip">Short · about {Math.round(slides.reduce((a, x) => a + x.seconds, 0) / 10) * 10} sec</span>
            <h1>{data.lesson.title}</h1>
            <button type="button" className="short-play" onClick={start} aria-label="Play short"><Icon name="zap" size={22} /> Play</button>
            <p className="small" style={{ opacity: 0.8 }}>Tap right to skip · tap left to go back · hold to pause</p>
          </div>
        )}

        {(state === 'playing' || state === 'paused') && s && (
          <div className="short-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerLeave={() => clearTimeout(holdTimer.current)}>
            <div key={i} className={`short-slide short-${s.kind}`}>
              <div className="short-blobs" aria-hidden><span /><span /><span /></div>
              <IconTile name={s.icon} tone={TONE_ORDER[i % TONE_ORDER.length]} size={s.kind === 'intro' ? 110 : 84} className="short-icon" />
              {s.kicker && <span className="short-kicker">{s.kicker}</span>}
              <p className="short-text">
                {s.text.split(' ').map((w, k) => <Fragment key={k}><span style={{ animationDelay: `${0.12 + k * 0.06}s` }}>{w}</span>{' '}</Fragment>)}
              </p>
            </div>
            {state === 'paused' && <div className="short-paused"><Icon name="lock" size={18} /> Paused · let go to play</div>}
          </div>
        )}

        {state === 'done' && (
          <div className="short-start">
            <IconTile name="trophy" tone="amber" size={100} className="short-icon" />
            <h1>Nice! Short complete</h1>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn" onClick={start}><Icon name="review" size={16} /> Watch again</button>
              <button type="button" className="btn btn-primary" onClick={() => navigate(day ? '/app/course' : `/app/learn/${id}/cards`)}>{day ? 'Back to today\'s session' : 'Swipe the lesson'} →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
