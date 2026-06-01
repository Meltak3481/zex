import { useState } from 'react';
import { useGame } from './GameContext.jsx';
import { useToast } from './Toast.jsx';
import { haptic, hapticSuccess, getUserDisplayName, getUserReferralCode, closeApp } from './telegram.js';
import { sfx } from './sound.js';
import { REFERRAL_REWARD, formatNumber } from './economy.js';

export default function AccountScreen() {
  const { state, actions } = useGame();
  const toast = useToast();
  const [friendCode, setFriendCode] = useState('');

  const displayName = getUserDisplayName() || 'Zex Network User';
  const myCode = getUserReferralCode() || 'ZEXGUEST';

  const copyCode = () => {
    haptic('light');
    try {
      navigator.clipboard?.writeText(myCode);
      toast('Referral code copied!');
    } catch {
      toast(myCode);
    }
  };

  const submitReferral = () => {
    const code = friendCode.trim().toUpperCase();
    if (state.referralUsed) {
      toast('You already used a referral code');
      haptic('rigid');
      return;
    }
    if (!code) {
      toast('Enter a friend\'s code');
      return;
    }
    if (code === myCode) {
      toast('You cannot use your own code');
      haptic('rigid');
      return;
    }
    actions.submitReferral();
    hapticSuccess();
    sfx.purchase();
    toast(`Referral applied! +${formatNumber(REFERRAL_REWARD.points)} pts, +${REFERRAL_REWARD.zex} ZEX`);
    setFriendCode('');
  };

  const applyKyc = () => {
    if (state.kycApplied) return;
    haptic('medium');
    actions.applyKyc();
    hapticSuccess();
    toast('Applied for KYC');
  };

  return (
    <div className="screen fade-in">
      <div className="account-title">{displayName.toUpperCase()}</div>

      {/* Referral kodu */}
      <div className="acc-section-label">Your Referral Code</div>
      <div className="referral-row">
        <button className="referral-code" onClick={copyCode}>
          {myCode} <span className="copy-hint">📋</span>
        </button>
        <div className="referral-reward">
          +{formatNumber(REFERRAL_REWARD.points)} pts<br />+{REFERRAL_REWARD.zex} ZEX
        </div>
      </div>
      <div className="used-codes">Friends invited: {state.referralCount}</div>

      {/* Arkadaş kodu gir */}
      <input
        className="referral-input"
        placeholder="Enter friend's code"
        value={friendCode}
        onChange={(e) => setFriendCode(e.target.value)}
        disabled={state.referralUsed}
      />
      <button
        className={'btn ' + (state.referralUsed ? 'btn-ghost' : 'btn-cyan')}
        style={{ width: '100%', marginTop: 10 }}
        onClick={submitReferral}
        disabled={state.referralUsed}
      >
        {state.referralUsed ? '✓ Referral Used' : 'Submit Referral Code'}
      </button>

      {/* Hesap bilgisi */}
      <div className="acc-section-label" style={{ marginTop: 26 }}>Account Information</div>
      <div className="acc-info-card">
        <div className="acc-info-row"><span>Full Name</span><strong>{displayName}</strong></div>
        <div className="acc-info-row"><span>Referral Code</span><strong>{myCode}</strong></div>
        <div className="acc-info-row"><span>KYC Status</span>
          <strong style={{ color: state.kycApplied ? 'var(--neon-orange)' : 'var(--text-dim)' }}>
            {state.kycApplied ? 'Pending Review' : 'Not Applied'}
          </strong>
        </div>
      </div>

      {/* KYC butonu */}
      <button
        className={'btn ' + (state.kycApplied ? 'btn-ghost' : 'btn-green')}
        style={{ width: '100%', marginTop: 16 }}
        onClick={applyKyc}
        disabled={state.kycApplied}
      >
        {state.kycApplied ? '⏳ Applied for KYC' : 'KYC Register'}
      </button>

      {/* Exit */}
      <button
        className="btn btn-danger"
        style={{ width: '100%', marginTop: 10 }}
        onClick={() => { haptic('medium'); closeApp(); }}
      >
        Exit
      </button>
    </div>
  );
}
