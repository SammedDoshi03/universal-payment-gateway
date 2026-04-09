'use client';
import React, { createContext, useContext, ReactNode } from 'react';

export interface PaymentConfig {
  defaultGateway?: 'STRIPE' | 'RAZORPAY';
  stripePublishableKey?: string;
  razorpayKeyId?: string;
}

const PaymentContext = createContext<PaymentConfig>({});

export const UniversalPaymentProvider = ({ 
  config, 
  children 
}: { 
  config: PaymentConfig; 
  children: ReactNode 
}) => {
  return (
    <PaymentContext.Provider value={config}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentConfig = () => useContext(PaymentContext);
