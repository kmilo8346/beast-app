import * as React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={30} height={30} fill="none">
      <Circle cx={15} cy={15} r={15} fill="#FFA953" />
      <Path
        d="M23.688 9.905a1.084 1.084 0 00-1.507 0l-9.409 9.184-4.953-4.835a1.084 1.084 0 00-1.507 0 1.023 1.023 0 000 1.471l5.706 5.57c.209.203.481.305.754.305.272 0 .545-.102.753-.305l10.163-9.92a1.023 1.023 0 000-1.47z"
        fill="#fff"
      />
    </Svg>
  );
};
