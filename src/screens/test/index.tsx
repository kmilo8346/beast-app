import React, { useReducer } from 'react';
import { TextInput, TextStyle } from 'react-native';
import validate from 'validate.js';

import { ScreenView, Button, ModalManageAddress, Input } from '../../components';

type SetVisibleAction = { type: 'set_visible', visible: boolean };
type Action = SetVisibleAction;
type State = {
    visible: boolean,
}
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'set_visible':
            return { ...state, visible: action.visible };
    }
}

export interface ScreenProps {
    navigation: any
}

const inputStyle: TextStyle = { borderStyle: 'solid', borderWidth: 1, height: 35 };

export default ({ navigation }: ScreenProps) => {
    const [state, dispatch] = useReducer(reducer, { visible: false });


    return (
        <ScreenView style={{ justifyContent: 'flex-end' }}>
            <Button title="select address" type="link" onPress={() => { dispatch({ type: 'set_visible', visible: true }) }} />
            <ModalManageAddress visible={state.visible} />

            <Input
                label="Dirección"
                placeholder="Jose Pedro Alessandri 927"
                value={"kuko"}
            />
            <Input
                label="Departamento"
                placeholder="1009"
                value={"kuko2"}
            />
            <Button title="Guardar" />
        </ScreenView>
    );
}