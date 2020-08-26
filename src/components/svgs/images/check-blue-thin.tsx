import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={113} height={113} fill="none">
      <Circle cx={56.25} cy={56.25} r={56.25} fill="#457AFF" />
      <Path
        d="M31.143 57.6L48.75 74.7l27.72-37.528"
        stroke="#fff"
        strokeWidth={5.4}
        strokeLinecap="round"
      />
    </Svg>
  );
};
