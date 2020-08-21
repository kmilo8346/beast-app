import React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <G fill="none" fillRule="evenodd">
        <Circle fill="#E3EEFF" cx={20} cy={20} r={20} />
        <G fill="#457AFF" fillRule="nonzero">
          <Path d="M21.064 23.28c.28 0 .532-.224.532-.532v-.896c0-3.024 4.2-3.136 4.2-6.832 0-2.828-2.744-4.9-5.712-4.9-3.612 0-5.684 2.464-5.684 2.464-.196.196-.224.532 0 .728l1.708 1.68c.7.616 1.232-1.148 3.192-1.148 1.204 0 2.1.784 2.1 1.652 0 1.792-3.864 2.828-3.864 5.18v2.072c0 .308.252.532.532.532h2.996zM19.552 30.28c1.26 0 2.352-1.036 2.352-2.296 0-1.26-1.092-2.324-2.352-2.324-1.232 0-2.296 1.064-2.296 2.324 0 1.26 1.064 2.296 2.296 2.296z" />
        </G>
      </G>
    </Svg>
  );
};
