import React, { ReactNode } from 'react';
import { Text, TextStyle } from "react-native";

import colors from '../../styles/colors';

export interface TextProps {
    level?: 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1,
    weight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900',
    ellipsis?: boolean,
    style?: TextStyle,
    color?: string,
    children: ReactNode
}

export default ({ level = 1, weight = 'normal', ellipsis = false, style = {}, color = colors.black, children }: TextProps) => {
    const baseSyle: TextStyle = {
        fontSize: getFontSize(level),
        fontWeight: weight,
        color
    };
    return (
        <Text style={[baseSyle, style]}>{children}</Text>
    );
};

function getFontSize(level: number): number {
    switch (level) {
        case 2:
            return 24;
        case 3:
            return 20;
        case 4:
            return 18;
        case 5:
            return 16;
        case 6:
            return 14;
        case 7:
            return 12;
        case 8:
            return 10;
        default:
            return 30;
    }
}

