/* global __PREVIEW__ */
// Connect your own Canva account (Free or Pro) and send designs to it.
import { useState } from 'react';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { renderDoc } from './DesignEditor.jsx';

export function useCanva() {
  return useApi('/canva/status');
}

export async function sendToCanva(doc, name) {
  const canvas = await renderDoc(doc);
  const png = canvas.toDataURL('image/png');
  const { editUrl } = await api.post('/canva/send-design', { name: name.slice(0, 80), png, width: doc.width, height: doc.height });
  return editUrl;
}

export function SendToCanvaButton({ doc, name, toast }) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(null);
  async function go() {
    setBusy(true);
    try {
      const url = await sendToCanva(doc, name);
      setLink(url);
      const w = window.open(url, '_blank', 'noopener');
      toast(w ? 'Opened in your Canva!' : 'Sent to your Canva. Use the link to open it.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  if (link) return <a className="btn btn-sm" href={link} target="_blank" rel="noopener noreferrer">Open in Canva ↗</a>;
  return <button className="btn btn-sm" onClick={go} disabled={busy}>{busy ? 'Sending…' : '🎨 Send to Canva'}</button>;
}

/** Card that connects / disconnects the learner's personal Canva account. */
export function CanvaConnectCard({ status, onChange }) {
  const [busy, setBusy] = useState(false);
  const s = status ?? { configured: false, connected: false };
  async function disconnect() {
    setBusy(true);
    await api.post('/canva/disconnect').catch(() => {});
    setBusy(false);
    onChange?.();
  }
  return (
    <div className="card row spread canva-card">
      <div style={{ flex: '1 1 320px' }}>
        <h3 style={{ margin: 0 }}>🎨 Your own Canva</h3>
        {s.connected ? (
          <p className="small" style={{ margin: '4px 0 0' }}>Connected{s.displayName ? ` as ${s.displayName}` : ''}. Use <b>Send to Canva</b> on any design to keep editing it in your own Canva, with all your Canva Free or Pro features.</p>
        ) : s.configured ? (
          <p className="muted small" style={{ margin: '4px 0 0' }}>Have a Canva account (Free or Pro)? Connect it to send any Marketcraft design straight into your Canva. If you upgrade to Canva Pro, your Pro features work there automatically.</p>
        ) : (
          <p className="muted small" style={{ margin: '4px 0 0' }}>{__PREVIEW__ ? 'Connecting your own Canva works in the full app.' : 'Canva connection isn\'t switched on for this site yet (the site admin adds a Canva integration).'} You can still open Canva in a new tab and use the Copy and Download buttons.</p>
        )}
      </div>
      <div className="row">
        {s.connected ? (
          <button className="btn btn-sm btn-ghost" onClick={disconnect} disabled={busy}>Disconnect</button>
        ) : s.configured ? (
          <a className="btn btn-primary" href="/api/canva/connect">Connect my Canva</a>
        ) : null}
        <a className="btn btn-sm" href="https://www.canva.com/" target="_blank" rel="noopener noreferrer">Open Canva ↗</a>
      </div>
    </div>
  );
}
