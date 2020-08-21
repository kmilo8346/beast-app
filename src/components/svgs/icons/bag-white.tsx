import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, Path, G, Mask, Use } from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

export default () => {
  /** TODO: Sacar componente del view pq es blanco */
  return (
    <View
      style={{
        backgroundColor: 'grey',
      }}
    >
      <Svg width={43} height={38} viewBox="0 0 43 38">
        <Defs>
          <Path id="prefix__a" d="M0 0h46v39H0z" />
        </Defs>
        <G transform="translate(-2 -1)" fill="none" fillRule="evenodd">
          <Mask id="prefix__b" fill="#fff">
            <Use xlinkHref="#prefix__a" />
          </Mask>
          <Path
            d="M40.001 59H7c-2.932 0-5.237-2.393-4.98-5.168l3.044-32.775c.23-2.47 2.37-4.332 4.979-4.332h3.086v-4.869C13.128 6.421 17.781 2 23.5 2c5.72 0 10.372 4.421 10.372 9.856v4.869h3.086c.552 0 1 .425 1 .95 0 .525-.448.95-1 .95h-3.086V22.9c0 .525-.448.95-1 .95s-1-.425-1-.95v-4.275h-13.12c-.553 0-1-.425-1-.95 0-.525.447-.95 1-.95h13.12v-4.869c0-4.387-3.755-7.956-8.372-7.956s-8.372 3.57-8.372 7.956V22.9c0 .525-.448.95-1 .95s-1-.425-1-.95v-4.275h-3.086c-1.566 0-2.85 1.118-2.988 2.6L4.011 54C3.856 55.67 5.237 57.1 7 57.1H40c1.764 0 3.143-1.433 2.988-3.1l-3.043-32.775c-.049-.523.358-.984.908-1.03.55-.046 1.035.34 1.083.863l3.043 32.775C45.238 56.608 42.932 59 40.001 59zm-21.974-9h-7.054A.987.987 0 0010 51c0 .552.436 1 .973 1h7.054A.987.987 0 0019 51c0-.552-.436-1-.973-1zm0-4h-7.054A.987.987 0 0010 47c0 .552.436 1 .973 1h7.054A.987.987 0 0019 47c0-.552-.436-1-.973-1z"
            stroke="#FFF"
            strokeWidth={1.5}
            fill="#FFF"
            fillRule="nonzero"
            mask="url(#prefix__b)"
          />
        </G>
      </Svg>
    </View>
  );
};
