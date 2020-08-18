import React from 'react';
import Svg, { Defs, Rect, G, Mask, Use, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={336} height={100} viewBox="0 0 336 100">
      <Defs>
        <Rect id="prefix__a" x={0} y={0} width={336} height={100} rx={13} />
      </Defs>
      <G fill="none" fillRule="evenodd">
        <Mask id="prefix__b" fill="#fff">
          <Use xlinkHref="#prefix__a" />
        </Mask>
        <Use fill="#457AFF" xlinkHref="#prefix__a" />
        <G
          mask="url(#prefix__b)"
          stroke="#4271F7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={5}
        >
          <Path d="M250 170.192s34.941-75.452 89-80.74M339 144.791s-47.028-35.933-45.983-83.087C294.062 14.551 339-25.76 339-25.76" />
          <Path d="M339 45.183s-28.827-72.776-82.21-73.654c-53.384-.877-121.716 47.398-122.783 127.272-1.068 79.874 124.918 5.266 124.918 5.266" />
          <Path d="M167 119.39s-6.353-78.098-91.059-70.2c-84.706 7.897-42.353 70.2-42.353 70.2" />
          <Path d="M78-35.74S13.959-6.493 15.013 27.773C16.067 62.04 58.445 51.7 58.445 51.7" />
          <Path d="M145 152.956s-70.314-50.884-62.855-141.13c7.459-90.246 82.05 35.047 15.983 8.762C32.062-5.698 56.368-35.74 56.368-35.74M218.588-38.462s-38.361 62.511 24.509 96.848C305.967 92.723 339 70.712 339 70.712" />
          <Path d="M8 105.092S15.016 23.87 96.27 42.27c81.25 18.399 38.48 108.871 38.48 108.871" />
        </G>
      </G>
    </Svg>
  );
};
