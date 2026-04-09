"use client";
import { useState } from 'react';
import { useUpiPayment, PaymentParams } from './useUpiPayment';
import { usePaymentConfig } from './UniversalPaymentProvider';
import { executeRazorpayCheckout } from './adapters/RazorpayAdapter';
import { executeStripeCheckout } from './adapters/StripeAdapter';

export interface UniversalPaymentResult {
  status: string;
  gateway?: string;
  nativeData?: any;
}

export interface UniversalPaymentParams extends Partial<PaymentParams> {
  method: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  gatewayOverride?: 'STRIPE' | 'RAZORPAY'; 
  amount?: string;
  currency?: string;
  sessionId?: string; // Standardized for Web Redirects
  clientSecret?: string; // Standardized for Stripe Mobile Intents
}

export const useUniversalPayment = () => {
  const [globalStatus, setGlobalStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'AWAITING_WEB_SCAN'>('IDLE');
  
  // We compose the original UPI hook internally
  const { initiate: initiateUpi } = useUpiPayment();
  const config = usePaymentConfig();

  const checkout = async (params: UniversalPaymentParams): Promise<UniversalPaymentResult> => {
    setGlobalStatus('PROCESSING');
    
    // 1. UPI FAST-PATH (Bypass Gateways exactly as we authored)
    if (params.method === 'UPI' && !params.gatewayOverride) {
      if (!params.pa || !params.pn || !params.am || !params.tr) {
         throw new Error("UPI method requires 'pa', 'pn', 'am', and 'tr' strictly.");
      }
      const result = await initiateUpi(params as PaymentParams);
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
      let result: UniversalPaymentResult | any;
      if (activeGateway === 'RAZORPAY') {
         result = await executeRazorpayCheckout(params, config.razorpayKeyId);
      } else if (activeGateway === 'STRIPE') {
         result = await executeStripeCheckout(params, config.stripePublishableKey);
      }

      setGlobalStatus('SUCCESS');
      return result as UniversalPaymentResult;
      
    } catch (error) {
      setGlobalStatus('FAILED');
      throw error;
    }
  };

  return { checkout, globalStatus };
};
