import * as React from 'react';

import { UniversalUpiViewProps } from './UniversalUpi.types';

export default function UniversalUpiView(props: UniversalUpiViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
