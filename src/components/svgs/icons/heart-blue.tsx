import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={13} height={11} fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.341 10.938a.596.596 0 01-.527 0C4.45 10.269 0 7.753 0 3.52 0 .41 4.15-.679 5.683 2.022c.203.253.528.296.781.01C8.02-.693 12.156.422 12.156 3.52c0 4.223-4.45 6.747-5.815 7.42z"
        fill="#3A72FF"
      />
    </Svg>
  );
};
