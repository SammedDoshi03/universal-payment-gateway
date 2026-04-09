# Testing & Development Guide

Welcome to the `universal-payment-gateway` testing environment! This guide explains how to quickly test the SDK locally across iOS, Android, and Web browsers before pushing updates to the NPM registry.

## 🛠️ Monorepo Structure

Because we use Turborepo, you have access to isolated testing environments automatically:
1. **`packages/universal-payment-gateway`**: The core SDK source code containing all native modules and React hooks.
2. **`apps/web`**: A Next.js testing environment to verify the Web Polyfills (QR Codes, Stripe DOM Injection).
3. **`packages/universal-payment-gateway/example`**: An Expo React Native app to verify iOS/Android behavior (UPI Intents).

---

## 📱 Phase 1: Testing on Mobile (Expo)

If you are modifying the UPI intents or mobile Stripe/Razorpay adapters, test them using the built-in React Native `example` app.

### Requirements
- **Node.js** (v18+)
- **Expo CLI** (installed automatically via Turborepo)
- **Xcode** (for iOS Simulator) OR **Android Studio** (for Android Emulator)
- *Real Device recommended for UPI testing (GPay/PhonePe block emulators).*

### Running the Mobile Test App
1. Open your terminal at the root of the monorepo:
   ```bash
   cd packages/universal-payment-gateway
   ```
2. Make sure you compile the SDK first if you've made changes:
   ```bash
   npm run build
   ```
3. Boot up the Expo Example app:
   ```bash
   npm run start
   ```
4. **Important**: Because we wrote custom native Android (Kotlin) code for the UPI Intents, you **cannot** just use Expo Go. You must press `Shift + A` in the Expo terminal to compile a "Development Client" (this triggers the `app.plugin.js` to modify the `AndroidManifest.xml`).

---

## 💻 Phase 2: Testing on Web (Next.js)

If you are modifying the dynamic QR Code generator or the `.web.ts` Javascript injections for browser checkouts, use the `apps/web` testing zone.

### Requirements
- **Node.js**

### Running the Web Test App
1. Open your terminal at the root of the monorepo:
   ```bash
   cd apps/web
   ```
2. Start the Turbopack Next.js development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your Desktop Browser.
4. Open the `apps/web/app/page.tsx` file and import the `useUniversalPayment` hook. Trigger a `'CARD'` payment to verify that an iframe from Stripe injects perfectly into the DOM!

---

## ✅ Core Features to Test Checklists
Before you run `npm publish --access public`, verify these core domains:

### 1. UPI Intent (Android)
- [ ] Connect a physical Android phone.
- [ ] Trigger `{ method: 'UPI' }`.
- [ ] Ensure the native bottom sheet pops up letting you pick Google Pay, PhonePe, or Paytm.
- [ ] Cancel the payment in GPay and verify the SDK returns properly catching the `FAILED` error string.

### 2. Desktop Web Fallback
- [ ] Open the app on a Desktop Chrome Browser.
- [ ] Trigger `{ method: 'UPI' }`.
- [ ] Verify a black-and-white QR code dynamically renders on-screen.

### 3. Stripe Mobile
- [ ] Trigger `{ method: 'CARD', gatewayOverride: 'STRIPE' }`.
- [ ] Ensure the app throws the *"Please npm install @stripe/stripe-react-native"* error successfully (since it's a peer dependency).
- [ ] Run `npm install @stripe/stripe-react-native` inside the `/example` directory, trigger it again, and verify the UI sheet loads.

### 4. Razorpay Web
- [ ] Open the Next.js app in Chrome.
- [ ] Trigger `{ method: 'NETBANKING', gatewayOverride: 'RAZORPAY' }`.
- [ ] Open the Chrome Inspector / Network tab and verify that `https://checkout.razorpay.com/v1/checkout.js` was automatically injected into the end of the `<body>` element.
