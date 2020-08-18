import React from 'react';
import Svg, { Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={20} height={20}>
      <Path
        d="M9.923 1C6.106 1 3 4.122 3 7.96c0 1.322.358 2.726 1.065 4.171.558 1.144 1.336 2.317 2.311 3.488 1.654 1.985 3.282 3.26 3.35 3.314a.319.319 0 00.393 0c.069-.054 1.697-1.329 3.351-3.314.975-1.17 1.753-2.344 2.312-3.488.706-1.445 1.064-2.849 1.064-4.171C16.846 4.122 13.74 1 9.923 1zm0 4.312a2.64 2.64 0 012.633 2.648 2.64 2.64 0 01-2.633 2.647A2.64 2.64 0 017.29 7.96a2.64 2.64 0 012.633-2.648z"
        fill="#92949B"
      />
    </Svg>
  );
};
