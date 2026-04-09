
"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import { useUniversalPayment, UpiWebInterface } from "universal-payment-gateway";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  const { checkout, globalStatus } = useUniversalPayment();

  const [upiUrl, setUpiUrl] = useState<string | null>(null);

  const handleStripe = async () => {
    try {
      await checkout({
        method: "CARD",
        gatewayOverride: "STRIPE",
        amount: "100.00",
        currency: "USD",
        sessionId: "cs_test_simulated_session_id"
      });
      alert('Stripe redirect successful!');
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  const handleRazorpay = async () => {
    try {
      await checkout({
        method: "NETBANKING",
        gatewayOverride: "RAZORPAY",
        amount: "200.00",
        currency: "INR"
      });
    } catch (error) {
       alert("Error: " + (error as Error).message);
    }
  };

  const handleUpi = async () => {
    try {
      const response = await checkout({
        method: "UPI",
        pa: "testmerchant@upi",
        pn: "Store Name",
        am: "500.00",
        tr: "order_123"
      });
      console.log(response);

      if (response.status === 'AWAITING_WEB_SCAN') {
        setUpiUrl(response.nativeData);
      }
    } catch (error) {
      alert("Error: " + (error as Error).message);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ThemeImage
          className={styles.logo}
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />

        <h2>Test the Master Payment SDK!</h2>

        <p>Status: <strong>{globalStatus}</strong></p>

        {upiUrl && (
          <div style={{ padding: '20px', background: 'white', border: '2px solid black', margin: '20px 0' }}>
            <h3>Scan this QR Code with any UPI App</h3>
            <UpiWebInterface upiUrl={upiUrl} amount="500.00" />
          </div>
        )}

        <div className={styles.ctas}>
          <button
            className={styles.primary}
            onClick={handleStripe}
          >
            💳 Pay via Stripe
          </button>

          <button
            onClick={handleRazorpay}
            className={styles.secondary}
          >
            🏦 Pay via Razorpay
          </button>

          <button
            onClick={handleUpi}
            style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid black', cursor: 'pointer' }}
          >
            📱 Pay via UPI (Web Fallback)
          </button>
        </div>
      </main>
    </div>
  );
}

