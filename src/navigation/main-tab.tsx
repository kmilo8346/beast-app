import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TextStyle } from 'react-native';

// navigation
import HomeStackScreen from './home-stack';
import SellerStackScreen from './seller-stack';
import MenuStackScreen from './menu-stack';
// components
import Icon from '../components/icon';
import Text from '../components/text';
// styles
import colors from '../styles/colors';

const MainTab = createBottomTabNavigator();

export default () => {
  // render logic
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color, size }) => {
            let name;
            switch (route.name) {
              case 'SellerStack':
                name = 'tag';
                break;
              case 'MenuStack':
                name = 'menu';
                break;
              default:
                name = 'home';
                break;
            }
            return <Icon name={name} size={size} color={color} />;
          },
          tabBarLabel: ({ position }) => {
            let text;
            switch (route.name) {
              case 'SellerStack':
                text = 'Vender';
                break;
              case 'MenuStack':
                text = 'Más';
                break;
              default:
                text = 'Inicio';
                break;
            }

            let style: TextStyle = {};
            if (position === 'beside-icon') {
              style = { marginLeft: 20, marginTop: 3 };
            }

            return (
              <Text level={8} style={style}>
                {text}
              </Text>
            );
          },
        };
      }}
      tabBarOptions={{
        activeTintColor: colors.blue,
        inactiveTintColor: colors.black,
        style: { paddingTop: 2 },
      }}
      initialRouteName="HomeStack"
    >
      <MainTab.Screen name="HomeStack" component={HomeStackScreen} />
      <MainTab.Screen name="SellerStack" component={SellerStackScreen} />
      <MainTab.Screen name="MenuStack" component={MenuStackScreen} />
    </MainTab.Navigator>
  );
};
