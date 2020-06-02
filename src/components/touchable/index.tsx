import React, { ReactNode } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface TouchableProps {
    onPress?: () => void
    style?: StyleProp<ViewStyle>,
    children: ReactNode
}

export default ({ onPress = () => null, style = {}, children }: TouchableProps) => {
    const containerStyle = [style];
    return (
        <TouchableOpacity onPress={onPress} style={containerStyle}>{children}</TouchableOpacity>
    );
}