// Web Polyfill for Razorpay
// This file executes securely inside desktop and mobile browsers, completely bypassing React Native modules.

export const executeRazorpayCheckout = async (options: any, keyId?: string) => {
  if (!keyId) throw new Error('Razorpay Key missing from UniversalPaymentProvider');
  
  console.log(`[Web Adapter] Injecting Razorpay DOM Script for ₹${options.amount}...`);

  return new Promise((resolve, reject) => {
    // 1. Verify if script already exists to prevent duplicate injection
    if (document.getElementById('razorpay-web-sdk')) {
      launchRazorpayWeb(options, keyId, resolve, reject);
      return;
    }

    // 2. Inject official Razorpay Web SDK
    const script = document.createElement('script');
    script.id = 'razorpay-web-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => launchRazorpayWeb(options, keyId, resolve, reject);
    script.onerror = () => reject(new Error("Failed to load Razorpay Web SDK directly into the DOM"));
    
    document.body.appendChild(script);
  });
};

const launchRazorpayWeb = (options: any, keyId: string, resolve: any, reject: any) => {
  try {
    const rzpOptions = {
      key: keyId,
      amount: String(Number(options.amount) * 100), // Razorpay Web strictly expects subunits (paise)
      currency: options.currency || "INR",
      name: options.pn || "Checkout",
      description: "Secure Payment",
      // Web specific handlers
      handler: function (response: any) {
        resolve({
          status: 'SUCCESS',
          gateway: 'RAZORPAY',
          nativeData: response.razorpay_payment_id
        });
      },
      prefill: {
        contact: options.mobile || "",
        email: options.email || ""
      },
      theme: {
        color: "#3399cc"
      }
    };

    const rzpInstance = new (window as any).Razorpay(rzpOptions);
    rzpInstance.on('payment.failed', function (response: any) {
      reject(new Error(response.error.description));
    });
    
    rzpInstance.open();
  } catch (err) {
    reject(err);
  }
};
