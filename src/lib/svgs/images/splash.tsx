import React from 'react';
import Svg, { Defs, Path, G, Mask, Use, Text, TSpan } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={375} height={783}>
      <Defs>
        <Path id="prefix__a" d="M0 0h375v783H0z" />
      </Defs>
      <G fill="none" fillRule="evenodd">
        <Path fill="#457AFF" d="M0 0h375v783H0z" />
        <Mask id="prefix__b" fill="#fff">
          <Use xlinkHref="#prefix__a" />
        </Mask>
        <Use fill="#457AFF" xlinkHref="#prefix__a" />
        <G
          opacity={0.504}
          mask="url(#prefix__b)"
          stroke="#4271F7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={16}
        >
          <Path d="M-145.15 605.5s213.07 87.942 228 224m-154.5-.5s101.763-118.592 235.3-115.957C297.189 715.68 411.35 829 411.35 829" />
          <Path d="M208.188 830s205.649-72.138 208.13-205.728c2.48-133.589-133.937-304.583-359.644-307.255-225.707-2.672-14.882 312.599-14.882 312.599" />
          <Path d="M-.15 399.5s222.944-15.97 200.399-228.912C177.704-42.352-.15 64.118-.15 64.118" />
          <Path d="M438.35 176S356.107 14.372 259.751 17.032c-96.355 2.661-67.283 109.614-67.283 109.614" />
          <Path d="M-93.65 345S50.078 168.08 304.993 186.848c254.915 18.768-98.996 206.447-24.75 40.217C354.492 60.835 439.35 121.988 439.35 121.988m6 406.982s-176.032-95.903-272.726 61.272C75.93 747.417 137.914 830 137.914 830" />
          <Path d="M41.345 0s229.288 17.488 177.347 220.033c-51.94 202.54-307.342 95.925-307.342 95.925" />
        </G>
        <Text
          fill="#294999"
          // TODO: fix this line -> fontFamily="Montserrat-Black, Montserrat"
          fontSize={38.984}
          fontWeight={700}
          transform="translate(50 340)"
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
          transform="translate(50 340)"
        >
          <TSpan x={77.093} y={87.12}>
            SHOP!
          </TSpan>
        </Text>
        <Path
          d="M111.92 362.121a4.71 4.71 0 011.986 1.809c.475.785.746 1.567.872 3.755l1.206 20.879 1.688 29.252a9.136 9.136 0 01-9.122 9.663H59.344a9.137 9.137 0 01-9.122-9.663l2.61-45.197.004-.093.28-4.84c.117-2.024.357-2.845.768-3.578l.051-.09c.018-.03.035-.059.054-.088a4.708 4.708 0 011.986-1.809c.825-.405 1.637-.622 3.82-.63h48.18c2.276 0 3.103.217 3.944.63z"
          fill="#FFF"
          fillRule="nonzero"
        />
        <Path
          d="M67.333 392.455c0 7.85 7.438 14.212 16.614 14.212 9.176 0 16.614-6.363 16.614-14.212"
          stroke="#457AFF"
          strokeWidth={7.614}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M97.12 368.09v-5.076c0-8.41-5.903-15.228-13.185-15.228-7.282 0-13.186 6.818-13.186 15.228v5.144"
          stroke="#294999"
          strokeWidth={6.091}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};
