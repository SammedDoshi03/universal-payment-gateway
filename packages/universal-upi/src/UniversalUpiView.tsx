import { requireNativeView } from 'expo';
import * as React from 'react';

import { UniversalUpiViewProps } from './UniversalUpi.types';

const NativeView: React.ComponentType<UniversalUpiViewProps> =
  requireNativeView('UniversalUpi');

export default function UniversalUpiView(props: UniversalUpiViewProps) {
  return <NativeView {...props} />;
}
