import React from 'react';
import Svg, { G, Ellipse, Path } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

interface ComponentProps {
  width?: number;
  height?: number;
}

export default ({ width = 40, height = 40 }: ComponentProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 30">
      <G transform="translate(1 1.5)" fill="none" fillRule="evenodd">
        <Ellipse fill="#EDF6FF" cx={14} cy={23.917} rx={14} ry={2.317} />
        <G fillRule="nonzero">
          <Path
            d="M14.127 0C9.11 0 5.03 4.112 5.03 9.167c0 1.742.47 3.59 1.399 5.494.734 1.507 1.757 3.052 3.038 4.594 2.173 2.615 4.313 4.294 4.403 4.365a.418.418 0 00.516 0c.09-.07 2.23-1.75 4.404-4.365 1.28-1.542 2.303-3.087 3.037-4.594.929-1.903 1.4-3.752 1.4-5.494C23.225 4.112 19.143 0 14.126 0zm0 5.68c1.911 0 3.46 1.56 3.46 3.487 0 1.925-1.549 3.486-3.46 3.486s-3.46-1.56-3.46-3.486c0-1.926 1.549-3.487 3.46-3.487z"
            fill="#457AFF"
          />
          <Path
            d="M14.127 0c-.3 0-.595.015-.887.044 4.601.45 8.21 4.37 8.21 9.123 0 1.742-.47 3.59-1.399 5.494-.734 1.507-1.756 3.052-3.037 4.594a33.21 33.21 0 01-3.774 3.843c.37.318.601.5.63.521a.418.418 0 00.515 0c.09-.07 2.23-1.749 4.404-4.364 1.28-1.542 2.303-3.087 3.037-4.594.929-1.903 1.4-3.752 1.4-5.495C23.225 4.112 19.143 0 14.126 0z"
            fill="#3A70FB"
          />
        </G>
      </G>
    </Svg>
  );
};
