"use client";
import { useState } from 'react';
import { Platform } from 'react-native';
import UniversalUpiModule from './UniversalUpiModule';

export interface PaymentParams {
  pa: string; // Payee VPA
  pn: string; // Payee Name
  am: string; // Amount
  tr: string; // Transaction Ref ID
  cu?: string; // Currency (default INR)
  mc?: string; // Merchant Code (optional)
  url?: string; // URL for transaction (optional)
  tn?: string; // Transaction Note (optional)
}

export interface PaymentState {
  status: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED';
  nativeData?: string;
  webFallbackUrl?: string;
  error?: Error;
}

export const useUpiPayment = () => {
  const [state, setState] = useState<PaymentState>({ status: 'IDLE' });

  const initiate = async (params: PaymentParams): Promise<PaymentState> => {
    // Build UPI URL string according to NPCI Specs
    const searchParams = new URLSearchParams();
    searchParams.append('pa', params.pa);
    searchParams.append('pn', params.pn);
    searchParams.append('am', params.am);
    searchParams.append('tr', params.tr);
    searchParams.append('cu', params.cu || 'INR');

    if (params.mc) searchParams.append('mc', params.mc);
    if (params.url) searchParams.append('url', params.url);
    if (params.tn) searchParams.append('tn', params.tn);

    // Some apps require the upi://pay scheme instead of https:// format deep links
    const upiUrl = `upi://pay?${searchParams.toString()}`;

    setState({ status: 'PENDING' });

    if (Platform.OS === 'web') {
      const webResult: PaymentState = { status: 'PENDING', webFallbackUrl: upiUrl };
      setState(webResult);
      return webResult;
    }

    try {
      if (Platform.OS === 'ios') {
        const { Linking } = require('react-native');
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (canOpen) {
          await Linking.openURL(upiUrl);
          const pendingResult: PaymentState = { status: 'PENDING', webFallbackUrl: upiUrl };
          setState(pendingResult);
          return pendingResult;
        } else {
          const error = new Error("No UPI apps installed");
          setState({ status: 'FAILED', error });
          throw error;
        }
      }

      // Trigger Native Intent (Android)
      const rawNativeResponse = await UniversalUpiModule.initiatePayment(upiUrl);

      // The Android intent returns a string like: txnId=XYZ&responseCode=00&Status=SUCCESS&txnRef=123
      const responseCodeLower = rawNativeResponse?.toLowerCase() || '';

      if (responseCodeLower.includes('status=success') || responseCodeLower.includes('txnstatus=success')) {
        const successResult: PaymentState = { status: 'SUCCESS', nativeData: rawNativeResponse };
        setState(successResult);
        return successResult;
      } else if (responseCodeLower.includes('status=submitted') || responseCodeLower.includes('status=pending')) {
        // Payment was initiated but bank is processing it
        const pendingResult: PaymentState = { status: 'PENDING', nativeData: rawNativeResponse };
        setState(pendingResult);
        return pendingResult;
      } else {
        const error = new Error("Transaction Failed locally or user cancelled");
        const failedResult: PaymentState = { status: 'FAILED', nativeData: rawNativeResponse, error };
        setState(failedResult);
        throw error;
      }
    } catch (err: any) {
      const errorResult: PaymentState = { status: 'FAILED', error: err };
      setState(errorResult);
      throw err;
    }
  };

  return { initiate, state };
};
