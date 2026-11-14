/* global __PREVIEW__ */
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { ErrorBox, Loading } from '../components/common.jsx';
import { Certificate, downloadCertificatePng, downloadCertificateSvg } from '../components/Certificate.jsx';
import { useUI } from '../store/ui.js';

export function CertificateList() {
  const { data, error, loading } = useApi('/studio/certificates');
  if (error) return <ErrorBox error={error} />;
  if (loading) return <Loading />;
  const certs = data.certificates;
  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header>
        <h1>My Certificates 🏅</h1>
        <p className="muted">Pass a Studio challenge to earn a certificate with its marketing badge.</p>
      </header>
      {certs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }} aria-hidden>🎯</div>
          <h2>No certificates yet</h2>
          <p className="muted">Complete a challenge in the Studio with a professional score of 85% or higher. Below that, the AI coach shows you what to fix and you can retry as many times as you need.</p>
          <Link className="btn btn-primary" to="/app/studio">Go to the Studio</Link>
        </div>
      ) : (
        <div className="grid stagger" style={{ '--min': '320px' }}>
          {certs.map((c) => (
            <Link key={c.id} to={`/app/certificates/${c.id}`} className="card interactive">
              <div className="certificate-wrap" style={{ padding: 4, marginBottom: 12 }}><Certificate cert={c} /></div>
              <div className="row spread">
                <b>{c.badge}</b>
                <span className={`chip ${c.tier === 'Distinction' ? 'chip-brand' : 'chip-success'}`}>{c.tier === 'Distinction' ? '🏆' : '🏅'} {c.tier} · {c.score}%</span>
              </div>
              <p className="muted small" style={{ margin: '6px 0 0' }}>{c.challengeTitle}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function CertificateView() {
  const { id } = useParams();
  const { data, error, loading } = useApi(`/studio/certificates/${id}`);
  const svgRef = useRef(null);
  const toast = useUI((s) => s.toast);
  const [busy, setBusy] = useState(false);

  if (error) return <ErrorBox error={error} />;
  if (loading) return <Loading />;
  const cert = data.certificate;
  const fileBase = `Marketcraft-Certificate-${cert.recipientName.replace(/[^\w]+/g, '-')}-${cert.verifyCode}`;
  const verifyUrl = `${window.location.origin}/verify/${cert.verifyCode}`;

  async function png() {
    setBusy(true);
    try {
      await downloadCertificatePng(svgRef.current, `${fileBase}.png`);
    } catch {
      toast('PNG export failed in this browser — try SVG or Print.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <div className="row spread no-print">
        <Link to="/app/certificates" className="muted small">← All certificates</Link>
        {__PREVIEW__ ? <span className="chip">Download & print work in the full app</span> : <div className="row">
          <button className="btn btn-primary" onClick={png} disabled={busy}>⬇️ Download PNG</button>
          <button className="btn" onClick={() => downloadCertificateSvg(svgRef.current, `${fileBase}.svg`)}>SVG</button>
          <button className="btn" onClick={() => window.print()}>🖨 Print / Save PDF</button>
        </div>}
      </div>
      <div className="certificate-wrap"><Certificate ref={svgRef} cert={cert} /></div>
      <div className="card no-print small">
        Anyone can verify this certificate at{' '}
        <a href={verifyUrl} target="_blank" rel="noopener noreferrer">{verifyUrl}</a>
        <button className="btn btn-sm btn-ghost" style={{ marginLeft: 8 }} onClick={() => navigator.clipboard?.writeText(verifyUrl).then(() => toast('Link copied!', 'success'))}>Copy</button>
      </div>
    </div>
  );
}
