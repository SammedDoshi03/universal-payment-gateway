import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface UpiWebInterfaceProps {
  upiUrl: string;
  amount: string;
  onMobileClick?: () => void;
}

export const UpiWebInterface: React.FC<UpiWebInterfaceProps> = ({ upiUrl, amount, onMobileClick }) => {
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleMobileClick = () => {
    if (onMobileClick) onMobileClick();
    if (typeof window !== 'undefined') {
      window.location.href = upiUrl;
    }
  };

  if (isMobile) {
    return (
      <button 
        onClick={handleMobileClick}
        style={{
          padding: '12px 24px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Pay ₹{amount} with UPI App
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <QRCodeSVG value={upiUrl} size={256} />
      <p style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>
        Scan with any UPI app to pay ₹{amount}
      </p>
    </div>
  );
};
