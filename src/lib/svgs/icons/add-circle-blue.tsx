import * as React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30">
      <G transform="translate(3 3)" fill="none" fillRule="evenodd">
        <Circle stroke="#457AFF" strokeWidth={1.5} cx={12} cy={12} r={12} />
        <Path
          d="M16.483 11.103h-3.586V7.517a.896.896 0 10-1.794 0v3.586H7.517a.896.896 0 100 1.794h3.586v3.586a.896.896 0 101.794 0v-3.586h3.586a.896.896 0 100-1.794z"
          fill="#457AFF"
          fillRule="nonzero"
        />
      </G>
    </Svg>
  );
};
