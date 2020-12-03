import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default ({ width = 90, height = 90 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 90 90">
      <G fillRule="nonzero" fill="none">
        <Path
          d="M89.632 44.865c0 24.725-20.042 44.767-44.767 44.767C20.143 89.632.101 69.59.101 44.865.1 20.143 20.143.101 44.865.101 69.59.1 89.632 20.143 89.632 44.865z"
          fill="#457AFF"
        />
        <Path
          d="M44.865.1c-3.88 0-7.648.495-11.24 1.424C52.907 6.51 67.15 24.024 67.15 44.865c0 20.842-14.241 38.356-33.525 43.342 3.592.93 7.36 1.423 11.24 1.423 24.725 0 44.767-20.042 44.767-44.765C89.632 20.141 69.59.101 44.865.101z"
          fill="#3A69E2"
          opacity={0.248}
        />
        <Path
          d="M34.452 67.612a6.298 6.298 0 01-4.455-1.845L16.626 52.394a6.3 6.3 0 010-8.91 6.3 6.3 0 018.91 0l8.917 8.917 24.735-24.736a6.302 6.302 0 018.91 8.911l-29.19 29.19a6.3 6.3 0 01-4.456 1.846z"
          fill="#FFF"
        />
      </G>
    </Svg>
  );
};
