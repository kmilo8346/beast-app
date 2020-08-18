import React from 'react';
import Svg, { Defs, Path, G, Mask, Use } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  return (
    <Svg width={375} height={42} viewBox="0 0 375 42">
      <Defs>
        <Path id="prefix__a" d="M.84.32h383v43H.84z" />
        <Path id="prefix__c" d="M0 0h46v39H0z" />
      </Defs>
      <G fill="none" fillRule="evenodd">
        <G transform="translate(-1 -1)">
          <Mask id="prefix__b" fill="#fff">
            <Use xlinkHref="#prefix__a" />
          </Mask>
          <Use fill="#457AFF" xlinkHref="#prefix__a" />
          <G
            opacity={0.804}
            mask="url(#prefix__b)"
            stroke="#4271F7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={9}
          >
            <Path d="M10-115.833S63.162-71.378 61.98-13.042C60.8 45.295 10 95.167 10 95.167" />
            <Path d="M10 5.096s31.499 89.971 89.83 91.056c58.332 1.085 132.996-58.597 134.163-157.344 1.166-98.747-136.496-6.51-136.496-6.51" />
            <Path d="M199-86.833s7.015 98.227 100.544 88.294c93.53-9.933 46.765-88.294 46.765-88.294" />
            <Path d="M296 106.167s71.157-35.858 69.986-77.87c-1.172-42.01-48.258-29.335-48.258-29.335" />
            <Path d="M221-126.833s77.12 63.37 68.938 175.761c-8.18 112.393-89.99-43.647-17.53-10.911 72.46 32.735 45.802 70.15 45.802 70.15M142.27 110.167s42.14-77.52-26.922-120.1C46.287-52.513 10-25.218 10-25.218" />
            <Path d="M374-66.47s-7.727 101.177-97.224 78.257c-89.494-22.92-42.385-135.62-42.385-135.62" />
          </G>
        </G>
      </G>
    </Svg>
  );
};
