# @sammeddoshi03/universal-payment-gateway

A powerful, cross-platform React and React Native SDK for seamless payment integrations. Instantly accept **UPI Intents**, **Credit Cards (Stripe)**, and **Netbanking (Razorpay)** using a single, incredibly clean unified React Hook.

## 🚀 Features

- **True Universal SDK**: Write your checkout code once. Route traffic based on the user's choice. 
- **Zero Bundle Bloat**: Stripe and Razorpay SDKs are loaded via **Dynamic Imports**. If you only use UPI, your app size stays incredibly small.
- **Native Android UPI Intents**: Opens GPay, PhonePe, and Paytm instantly. *Zero Commission.*
- **Intelligent Web Fallback**: Displays dynamic, scannable QR Codes for Desktop browsers automatically.
- **Expo & Bare RN Compatible**: Powered by the modern JSI architecture.

---

## 📦 Installation

```bash
npm install universal-payment-gateway
```

If you plan to use the Credit Card or Netbanking gateways, ensure you install their respective peer dependencies. *(Optional)*
```bash
npm install @stripe/stripe-react-native react-native-razorpay
```

### Expo Native Linking (Required for Mobile)
Add the plugin to your `app.json` or `app.config.js` to automatically inject the correct intent schemas into your mobile manifests.
```json
{
  "expo": {
    "plugins": ["universal-payment-gateway"]
  }
}
```

Prebuild to apply the native changes:
```bash
npx expo prebuild
```

---

## 🛠️ The Global Provider

Before invoking the payment logic, wrap your application in the `UniversalPaymentProvider` to securely inject your Gateway API keys.

```tsx
// App.tsx
import { UniversalPaymentProvider } from 'universal-payment-gateway';

export default function App() {
  return (
    <UniversalPaymentProvider config={{
      defaultGateway: 'RAZORPAY',
      stripePublishableKey: 'pk_live_your_stripe_key',
      razorpayKeyId: 'rzp_live_your_razorpay_key'
    }}>
      <CheckoutScreen />
    </UniversalPaymentProvider>
  );
}
```

---

## 💻 Usage & Examples

Our SDK simplifies multi-gateway routing into a single hook: `useUniversalPayment({ method })`.

### Example 1: Direct UPI Intent (Zero Commission)
Using the `UPI` method bypasses Stripe/Razorpay entirely and directly invokes the Google Pay / PhonePe native apps installed on the device.

```tsx
import { useUniversalPayment } from 'universal-payment-gateway';

export function UPIButton() {
  const { checkout, globalStatus } = useUniversalPayment();

  const handlePay = async () => {
    try {
      const response = await checkout({
        method: 'UPI',
        pa: 'merchant@upi',
        pn: 'Awesome Store',
        am: '100.00',
        tr: 'order_12345678',
      });
      console.log('UPI Transaction Successful:', response.nativeData);
    } catch (err) {
      console.error('Payment failed / cancelled', err);
    }
  };

  return <Button title="Pay via native UPI📱" onPress={handlePay} />;
}
```

### Example 2: Stripe Credit Cards
```tsx
import { useUniversalPayment } from 'universal-payment-gateway';

export function CreditCardButton() {
  const { checkout } = useUniversalPayment();

  const handlePay = async () => {
    // Triggers '@stripe/stripe-react-native' Payment Sheet dynamically
    const response = await checkout({
      method: 'CARD',
      gatewayOverride: 'STRIPE',
      amount: '100.00',
      currency: 'INR' // or 'USD'
    });
  };

  return <Button title="Pay via Credit Card 💳" onPress={handlePay} />;
}
```

### Example 3: Razorpay Netbanking & Wallets
```tsx
import { useUniversalPayment } from 'universal-payment-gateway';

export function NetbankingButton() {
  const { checkout } = useUniversalPayment();

  const handlePay = async () => {
    // Triggers 'react-native-razorpay' drop-in UI dynamically
    const response = await checkout({
      method: 'NETBANKING',
      gatewayOverride: 'RAZORPAY',
      amount: '100.00'
    });
  };

  return <Button title="Pay via Netbanking / Wallet 🏦" onPress={handlePay} />;
}
```

---

## ⚠️ Security Warning

**Never mark an order as "paid" exclusively based on the client-side `SUCCESS` response.** 
Modified Android APKs can intercept intent results. Pinging your secure backend server for Server-to-Server (S2S) validation is explicitly required before fulfilling an order.

---
## ⚖️ License
MIT License. Created by Sammed Doshi.
