import { useState } from 'react';
import { useUpiPayment, PaymentParams } from './useUpiPayment';
import { usePaymentConfig } from './UniversalPaymentProvider';
import { executeRazorpayCheckout } from './adapters/RazorpayAdapter';
import { executeStripeCheckout } from './adapters/StripeAdapter';

export interface UniversalPaymentParams extends PaymentParams {
  method: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  gatewayOverride?: 'STRIPE' | 'RAZORPAY'; 
}

export const useUniversalPayment = () => {
  const [globalStatus, setGlobalStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');
  
  // We compose the original UPI hook internally
  const { initiate: initiateUpi } = useUpiPayment();
  const config = usePaymentConfig();

  const checkout = async (params: UniversalPaymentParams) => {
    setGlobalStatus('PROCESSING');
    
    // 1. UPI FAST-PATH (Bypass Gateways exactly as we authored)
    if (params.method === 'UPI' && !params.gatewayOverride) {
      const result = await initiateUpi(params);
      setGlobalStatus(result.status as any);
      return { ...result, gateway: 'DIRECT_DEEP_LINK' };
    }

    // 2. DETERMINE WHICH GATEWAY TO USE
    const activeGateway = params.gatewayOverride || config.defaultGateway;
    if (!activeGateway) {
       setGlobalStatus('FAILED');
       throw new Error('You requested a Card/Netbanking payment but did not configure a gateway in UniversalPaymentProvider.');
    }

    // 3. ROUTE TO REQUIRED GATEWAY ADAPTER
    try {
      let result;
      if (activeGateway === 'RAZORPAY') {
         result = await executeRazorpayCheckout(params, config.razorpayKeyId);
      } else if (activeGateway === 'STRIPE') {
         result = await executeStripeCheckout(params, config.stripePublishableKey);
      }

      setGlobalStatus('SUCCESS');
      return result;
      
    } catch (error) {
      setGlobalStatus('FAILED');
      throw error;
    }
  };

  return { checkout, globalStatus };
};
