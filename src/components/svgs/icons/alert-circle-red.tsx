import React from 'react';
import Svg, { G, Circle, Text, TSpan } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <G fill="none" fillRule="evenodd">
        <Circle stroke="#D1321E" cx={10} cy={10} r={9.5} />
        <Text
          // TODO: (--IF NECESSARY--) fix this line -> fontFamily="Quicksand-Medium, Quicksand"
          fontSize={16}
          fontWeight={400}
          letterSpacing={-0.178}
          fill="#D1321E"
        >
          <TSpan x={8.571} y={16}>
            !
          </TSpan>
        </Text>
      </G>
    </Svg>
  );
};
