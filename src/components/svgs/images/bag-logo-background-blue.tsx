import React from 'react';
import Svg, { G, Rect, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={65} height={65} viewBox="0 0 65 65">
      <G fill="none" fillRule="evenodd">
        <Rect
          fill="#457AFF"
          fillRule="nonzero"
          width={64.573}
          height={64.573}
          rx={32.287}
        />
        <Path
          d="M46.594 18.644c.432.213.776.527 1.02.932.245.405.384.808.449 1.936l.141 2.464.005.077 1.34 23.309a4.707 4.707 0 01-4.699 4.978H19.597a4.707 4.707 0 01-4.7-4.978l1.341-23.309.005-.077.141-2.464c.065-1.128.204-1.531.449-1.936.244-.405.588-.72 1.02-.932.424-.21.842-.321 1.964-.325h24.75c1.17 0 1.595.112 2.027.325z"
          fill="#FFF"
          fillRule="nonzero"
        />
        <Path
          d="M23.688 34.282c0 4.047 3.822 7.328 8.536 7.328 4.713 0 8.535-3.28 8.535-7.328"
          stroke="#457AFF"
          strokeWidth={4.044}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M38.991 21.72v-2.616c0-4.336-3.032-7.851-6.774-7.851-3.74 0-6.774 3.515-6.774 7.85v2.653"
          stroke="#294999"
          strokeWidth={3.235}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};
