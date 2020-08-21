import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={30} height={30} fill="none">
      <Circle cx={15} cy={15} r={15} fill="#F96363" />
      <Path d="M7 15h15" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
};
