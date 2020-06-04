import React from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';

const awesome = ['whatsapp']

export default (props: any) => {
    if (awesome.indexOf(props.name) !== -1) {
        return <FontAwesome size={24} {...props} />
    }
    return <Feather size={24} {...props} />
};