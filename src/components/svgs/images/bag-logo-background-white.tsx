import React from 'react';
import { View } from 'react-native';
import Svg, { G, Text, TSpan, Path } from 'react-native-svg';
import colors from '../../../styles/colors';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  // TODO: remove the view if it is on a colored background
  return (
    <View style={{ backgroundColor: colors.blue }}>
      <Svg width={273} height={85} viewBox="0 0 273 85">
        <G fill="none" fillRule="evenodd">
          <Text
            fill="#294999"
            // TODO: fix this line -> fontFamily="Montserrat-Black, Montserrat"
            fontSize={38.984}
            fontWeight={700}
            transform="translate(0 -4)"
          >
            <TSpan x={77.347} y={38.679}>
              SHOP
            </TSpan>
          </Text>
          <Text
            fill="#FFF"
            // TODO: fix this line -> fontFamily="Montserrat-Black, Montserrat"
            fontSize={58.476}
            fontWeight={700}
            transform="translate(0 -4)"
          >
            <TSpan x={77.093} y={87.12}>
              SHOP!
            </TSpan>
          </Text>
          <Path
            d="M61.92 18.121a4.71 4.71 0 011.986 1.809c.475.785.746 1.567.872 3.755l1.206 20.879 1.688 29.252a9.136 9.136 0 01-9.122 9.663H9.344a9.137 9.137 0 01-9.122-9.663l2.61-45.197.004-.093.28-4.84c.117-2.024.357-2.845.768-3.578l.051-.09c.018-.03.035-.059.054-.088a4.708 4.708 0 011.986-1.809c.825-.405 1.637-.622 3.82-.63h48.18c2.276 0 3.103.217 3.944.63z"
            fill="#FFF"
            fillRule="nonzero"
          />
          <Path
            d="M17.333 48.455c0 7.85 7.438 14.212 16.614 14.212 9.176 0 16.614-6.363 16.614-14.212"
            stroke="#457AFF"
            strokeWidth={7.614}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M47.12 24.09v-5.076c0-8.41-5.903-15.228-13.185-15.228-7.282 0-13.186 6.818-13.186 15.228v5.144"
            stroke="#294999"
            strokeWidth={6.091}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};
