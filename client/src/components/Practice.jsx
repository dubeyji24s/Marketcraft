// Practice blocks shared by swipe lessons, the full lesson page and the daily Flashback:
// a "What would you do?" scenario and quiz questions with instant feedback.
import { useState } from 'react';
import { api } from '../lib/api.js';
import { announcePlay } from '../lib/play.js';
import { useUI } from '../store/ui.js';
import { Icon } from './Icon.jsx';

export function ScenarioBlock({ lessonId, scenario, onDone }) {
  const [picked, setPicked] = useState(null);
  async function choose(i) {
    if (picked != null) return;
    setPicked(i);
    try {
      const r = await api.post(`/play/scenario/${lessonId}`, { choice: i });
      if (r.xpEarned) useUI.getState().toast(`+${r.xpEarned} XP for deciding`, 'success');
      if (r.newBadges?.length) useUI.getState().celebrate({ badges: r.newBadges, xp: 0, title: 'New badge!' });
      announcePlay(r.play);
      onDone?.(i);
    } catch (e) {
      useUI.getState().toast(e.message, 'error');
    }
  }
  const best = scenario.options.findIndex((o) => o.best);
  return (
    <div className="practice">
      <p className="practice-setup">{scenario.setup}</p>
      <div className="practice-options" role="group" aria-label="Choose what you would do">
        {scenario.options.map((o, i) => {
          const state = picked == null ? '' : i === best ? 'best' : i === picked ? 'wrong' : 'dim';
          return (
            <button key={i} type="button" className={`practice-option ${state}`} onClick={() => choose(i)} disabled={picked != null} aria-pressed={picked === i}>
              <span className="practice-letter">{picked != null && i === best ? <Icon name="checklist" size={16} /> : String.fromCharCode(65 + i)}</span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
      {picked != null && (
        <div className={`practice-result ${scenario.options[picked].best ? 'good' : 'bad'}`} role="status">
          <b>{scenario.options[picked].best ? 'Great call!' : 'Hmm, here\'s what happens…'}</b>
          <p>{scenario.options[picked].result}</p>
          {!scenario.options[picked].best && <p><b>Best move:</b> {scenario.options[best].text}. {scenario.options[best].result}</p>}
        </div>
      )}
    </div>
  );
}

/** One quiz question; the first answer is checked instantly and locked in. */
export function QuizBlock({ lessonId, index, question, options, onAnswer }) {
  const [picked, setPicked] = useState(null);
  const [check, setCheck] = useState(null);
  async function choose(i) {
    if (picked != null) return;
    setPicked(i);
    try {
      const r = await api.post(`/lessons/${lessonId}/check`, { index, answer: i });
      setCheck(r);
      onAnswer?.(i, r.correct);
    } catch (e) {
      useUI.getState().toast(e.message, 'error');
    }
  }
  return (
    <div className="practice">
      <h2 className="practice-q">{question}</h2>
      <div className="practice-options" role="group" aria-label={question}>
        {options.map((o, i) => {
          const state = !check ? (picked === i ? 'picked' : '') : i === check.answerIndex ? 'best' : i === picked ? 'wrong' : 'dim';
          return (
            <button key={i} type="button" className={`practice-option ${state}`} onClick={() => choose(i)} disabled={picked != null} aria-pressed={picked === i}>
              <span className="practice-letter">{check && i === check.answerIndex ? <Icon name="checklist" size={16} /> : String.fromCharCode(65 + i)}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {check && (
        <div className={`practice-result ${check.correct ? 'good' : 'bad'}`} role="status">
          <b>{check.correct ? 'Correct!' : `Not quite. The answer is ${String.fromCharCode(65 + check.answerIndex)}.`}</b>
        </div>
      )}
    </div>
  );
}
