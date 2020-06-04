import React, { ReactNode } from 'react';
import { ViewStyle, StyleProp, GestureResponderEvent, TouchableOpacity } from 'react-native';

export interface TouchableProps {
    onPress?: (event: GestureResponderEvent) => void
    style?: StyleProp<ViewStyle>,
    children: ReactNode
}

export default ({ onPress = () => null, style = {}, children }: TouchableProps) => {
    const containerStyle = [style];
    return (
        <TouchableOpacity onPress={onPress} style={containerStyle}>{children}</TouchableOpacity>
    );
}