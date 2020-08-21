import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25">
      <G fill="#919299" fillRule="nonzero" stroke="#91929A" strokeWidth={0.5}>
        <Path d="M12.497 3.5a8.997 8.997 0 108.998 8.997A9.007 9.007 0 0012.497 3.5zm0 16.71a7.712 7.712 0 117.713-7.713 7.72 7.72 0 01-7.713 7.713z" />
        <Path d="M17.756 13.221a.643.643 0 00-.642-.643h-4.5V8.08a.643.643 0 10-1.285 0v5.141c0 .355.288.643.643.643h5.142a.643.643 0 00.642-.643z" />
      </G>
    </Svg>
  );
};
