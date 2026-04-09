// This is an abstraction layer for integrating Razorpay Native SDK or Web Checkout
export const executeRazorpayCheckout = async (options: any, keyId?: string) => {
  if (!keyId) throw new Error('Razorpay Key missing from UniversalPaymentProvider');
  
  console.log(`[Adapter] Initiating Razorpay checkout for ₹${options.amount}...`);
  
  try {
    // Dynamic import to prevent bundle bloat for users who don't use Razorpay
    require('react-native-razorpay');
    
    // Simulate API delay instead of full RazorpayCheckout.open() for structure 
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'SUCCESS',
          gateway: 'RAZORPAY',
          nativeData: 'rzp_pay_xyz123'
        });
      }, 1500);
    });
  } catch (err) {
    if ((err as Error).message.includes('not found')) {
      throw new Error("You requested a RAZORPAY payment but 'react-native-razorpay' is not installed. Please npm install it.");
    }
    throw err;
  }
};
