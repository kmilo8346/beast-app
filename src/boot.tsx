import React, { ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackHeaderTitleProps } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen, PLPScreen, PDPScreen, ToSaleScreen, MenuScreen } from './screens';
import { Icon, Text } from './components'
import colors from './styles/colors';

const commonStackOptions: any = {
    headerBackImage: () => <Icon name="chevron-left" />,
    headerBackTitleVisible: false,
    headerLeftContainerStyle: {
        marginLeft: 18,
    },
    title: '',
    headerTitle: (props: StackHeaderTitleProps) => <Text level={2} style={props.style}>{props.children}</Text>,
    headerStyle: {
        shadowColor: 'transparent',
    },
    headerTitleAlign: 'center',
};

const HomeStack = createStackNavigator();

function HomeStackScreen() {
    return (
        <HomeStack.Navigator screenOptions={commonStackOptions} initialRouteName="PLP">
            <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <HomeStack.Screen name="PLP" component={PLPScreen} />
            <HomeStack.Screen name="PDP" component={PDPScreen} />
        </HomeStack.Navigator>
    );
}

const ToSaleStack = createStackNavigator();

function ToSaleStackScreen() {
    return (
        <ToSaleStack.Navigator screenOptions={commonStackOptions}>
            <ToSaleStack.Screen name="ToSale" component={ToSaleScreen} options={{ headerShown: false }} />
        </ToSaleStack.Navigator>
    );
}

const MenuStack = createStackNavigator();

function MenuStackScreen() {
    return (
        <MenuStack.Navigator screenOptions={commonStackOptions}>
            <MenuStack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
        </MenuStack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

/**
 * Boot component control de navigation in boot time
 */
function Boot() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({ focused, color, size }) => {
                            let name;
                            switch (route.name) {
                                case 'ToSale':
                                    name = 'tag'
                                    break;
                                case 'Menu':
                                    name = 'menu'
                                    break;
                                default:
                                    name = 'home';
                                    break;
                            }
                            return <Icon name={name} size={size} color={color} />;
                        },
                        tabBarLabel: ({ focused, color }) => {
                            let text;
                            switch (route.name) {
                                case 'ToSale':
                                    text = 'Vender'
                                    break;
                                case 'Menu':
                                    text = 'Más'
                                    break;
                                default:
                                    text = 'Inicio';
                                    break;
                            }
                            return <Text level={8}>{text}</Text>;
                        },

                    })}
                    tabBarOptions={{
                        activeTintColor: colors.blue,
                        inactiveTintColor: colors.black,
                    }}>
                    <Tab.Screen name="Home" component={HomeStackScreen} />
                    <Tab.Screen name="ToSale" component={ToSaleStackScreen} />
                    <Tab.Screen name="Menu" component={MenuStackScreen} />
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>

    );
}

export default Boot;
