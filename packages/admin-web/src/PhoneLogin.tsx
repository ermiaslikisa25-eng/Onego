import { useState } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import { createRecaptcha, requestOtp } from '@onego/shared';

export default function PhoneLogin({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState('+251');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function send() { setBusy(true); setError(''); try { setConfirmation(await requestOtp(phone, createRecaptcha('recaptcha'))); } catch (e: any) { setError(e?.message || 'Could not send OTP.'); } finally { setBusy(false); } }
  async function verify() { if (!confirmation) return; setBusy(true); setError(''); try { await confirmation.confirm(code); onDone(); } catch (e: any) { setError(e?.message || 'Invalid code.'); } finally { setBusy(false); } }
  return <div className="card auth"><h2>OneGo</h2><p>Admin phone verification</p>{!confirmation ? <><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+2519XXXXXXXX"/><button disabled={busy} onClick={send}>{busy?'Sending...':'Send OTP'}</button></> : <><input value={code} onChange={e=>setCode(e.target.value)} placeholder="6-digit code"/><button disabled={busy} onClick={verify}>{busy?'Checking...':'Verify'}</button></>}<div id="recaptcha"/>{error&&<div className="error">{error}</div>}</div>;
}
