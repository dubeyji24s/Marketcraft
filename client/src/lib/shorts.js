// "Shorts": turns a lesson into a 60–90 second, auto-playing, narrated video-style story.
// Everything is generated in the browser (animated slides + free browser voice + optional
// original beats), so it costs nothing and needs no video files.
import { plain } from './cards.js';
import { topicIcon } from '../components/Icon.jsx';

const firstSentences = (text, n) => (plain(text).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+/g) ?? [plain(text)]).slice(0, n).join(' ').trim();
const clip = (s, max) => (s.length <= max ? s : `${s.slice(0, max).replace(/\s+\S*$/, '')}…`);

const INTRO = {
  kid: (t) => ({ kicker: 'Hey, entrepreneur!', text: `Today's short: ${t}` }),
  owner: (t) => ({ kicker: 'Today\'s lesson', text: t }),
  pro: (t) => ({ kicker: 'In about a minute', text: t }),
};
export const SHORT_BEAT = { kid: 'pop', owner: 'lofi', pro: 'corporate' };

/** Seconds a slide stays on screen (about 2.6 words per second, plus breathing room). */
export const slideSeconds = (s) => Math.max(3.5, Math.min(11, `${s.kicker ?? ''} ${s.text}`.split(/\s+/).length / 2.6 + 1.4));

export function buildShort(lesson, { track = 'owner', project } = {}) {
  const kid = track === 'kid';
  const slides = [];
  slides.push({ kind: 'intro', icon: topicIcon(lesson.title, lesson.summary), ...INTRO[track](lesson.title) });
  const hook = firstSentences(lesson.summary, 1);
  slides.push({ kind: 'hook', icon: 'sparkles', kicker: kid ? 'Did you know?' : 'Why it matters', text: clip(hook, kid ? 120 : 170) });
  lesson.sections.slice(0, kid ? 4 : 5).forEach((s, i) => {
    slides.push({ kind: 'point', icon: topicIcon(s.heading, s.body), kicker: `${i + 1}. ${s.heading}`, text: clip(firstSentences(s.body, kid ? 1 : 2), kid ? 130 : 200) });
  });
  const tk = (lesson.keyTakeaways ?? []).slice(0, kid ? 2 : 3);
  if (tk.length) slides.push({ kind: 'remember', icon: 'brain', kicker: 'Remember', text: tk.join(' · ') });
  if (project) slides.push({ kind: 'try', icon: 'rocket', kicker: kid ? 'Your mission today' : 'Do it today', text: clip(project, 170) });
  slides.push({ kind: 'outro', icon: 'compass', kicker: 'Up next', text: kid ? 'Swipe the lesson and make a big decision!' : 'Swipe the lesson, then solve a real-world scenario.' });
  return slides.map((s, i) => ({ ...s, seconds: slideSeconds(s), index: i }));
}

export const speakSlide = (s) => `${s.kicker ? `${s.kicker.replace(/^\d+\.\s*/, '')}. ` : ''}${s.text}`;
