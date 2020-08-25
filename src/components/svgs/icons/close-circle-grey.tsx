import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={30} height={30} fill="none">
      <Circle
        opacity={0.146}
        cx={14.709}
        cy={14.709}
        r={14.709}
        fill="#979797"
      />
      <Path
        d="M8.676 20.647L20.439 8.98m.452 11.638L8.625 9.481"
        stroke="#606786"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
