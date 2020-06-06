import React, { ReactNode } from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

export interface TouchableProps extends TouchableOpacityProps {
    children: ReactNode,
}

export default ({ children, ...otherProps }: TouchableProps) => {
    return (
        <TouchableOpacity {...otherProps} >{children}</TouchableOpacity>
    );
}