import React, { useState } from 'react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { auth, createRecaptcha, requestOtp } from '@onego/shared';

export default function PhoneLogin({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState('+251');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    setError('');
    setBusy(true);
    try {
      const verifier = createRecaptcha('recaptcha');
      setConfirmation(await requestOtp(phone, verifier));
    } catch (e: any) {
      setError(e?.message || 'Could not send OTP.');
    }
    setBusy(false);
  }

  async function verify() {
    if (!confirmation) return;
    setBusy(true);
    setError('');
    try {
      await confirmation.confirm(code);
      onDone();
    } catch (e: any) {
      setError(e?.message || 'Invalid code.');
    }
    setBusy(false);
  }

  return (
    <div className="card auth">
      <h2>OneGo</h2>
      <p>Phone verification</p>
      {!confirmation ? (
        <>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+2519XXXXXXXX"
          />
          <button disabled={busy} onClick={send}>
            {busy ? 'Sending...' : 'Send OTP'}
          </button>
        </>
      ) : (
        <>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
          />
          <button disabled={busy} onClick={verify}>
            {busy ? 'Checking...' : 'Verify'}
          </button>
        </>
      )}
      <div id="recaptcha"></div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
