// This is an abstraction layer for integrating Razorpay Native SDK or Web Checkout
export const executeRazorpayCheckout = async (options: any, keyId?: string) => {
  if (!keyId) throw new Error('Razorpay Key missing from UniversalPaymentProvider');
  
  console.log(`[Adapter] Initiating Razorpay checkout for ₹${options.amount}...`);
  
  try {
    // Dynamic import to prevent bundle bloat for users who don't use Razorpay
    const RazorpayCheckout = require('react-native-razorpay').default;
    
    const rzpOptions = {
      description: 'Transaction',
      currency: options.currency || "INR",
      key: keyId,
      amount: String(Number(options.amount) * 100), // Razorpay natively expects subunits (paise/cents)
      name: options.pn || 'Retail Store',
      order_id: options.sessionId, // Must be passed via options to support real S2S integration
      prefill: {
        method: options.method === 'NETBANKING' ? 'netbanking' 
              : options.method === 'WALLET' ? 'wallet' 
              : options.method === 'CARD' ? 'card' 
              : undefined
      },
      theme: { color: "#3399cc" }
    };
    
    return new Promise((resolve, reject) => {
      RazorpayCheckout.open(rzpOptions).then((data: any) => {
        resolve({
          status: 'SUCCESS',
          gateway: 'RAZORPAY',
          nativeData: data.razorpay_payment_id
        });
      }).catch((error: any) => {
        reject(new Error(error.description || error.message || "Razorpay transaction failed or was cancelled."));
      });
    });
  } catch (err) {
    if ((err as Error).message.includes('not found')) {
      throw new Error("You requested a RAZORPAY payment but 'react-native-razorpay' is not installed. Please npm install it.");
    }
    throw err;
  }
};
