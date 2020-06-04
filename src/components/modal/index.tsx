import React, { ReactNode, useState, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Modal, NativeSyntheticEvent, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Text from '../text';
import Touchable from '../touchable';
import Icon from '../icon';
import styles from "./styles";


export interface ModalProps {
    type?: 'auto' | 'full',
    visible: boolean,
    title?: string,
    draggable?: boolean,
    modalStyle?: ViewStyle,
    children?: ReactNode,
    onShow?: (event: NativeSyntheticEvent<any>) => void,
    onClose?: () => void,
}

export default ({ type = 'auto', visible, title = '', draggable = true, modalStyle = {}, children = null, onShow = () => null, onClose = () => null }: ModalProps) => {
    const [_visible, set_visible] = useState(visible);
    useEffect(() => {
        set_visible(visible)
    }, [visible])

    const hide = () => {
        set_visible(false);
        onClose()
    }

    let content;
    switch (type) {
        case 'full':
            content = (
                <SafeAreaView style={[styles.modal, styles.modal_full, modalStyle]}>
                    <View style={styles.header}>
                        {title && <Text level={2} weight="bold">{title}</Text>}
                        <View style={styles.closeContainer}>
                            <Touchable style={styles.close} onPress={hide}>
                                <Icon name="x" />
                            </Touchable>
                        </View>
                    </View>
                    {children}
                </SafeAreaView>
            )
            break;

        default:
            content = (
                <View style={styles.containerBackdrop} >
                    <TouchableWithoutFeedback onPress={hide} style={styles.backdrop}>
                        <View style={styles.containerModal}>
                            <TouchableWithoutFeedback onPress={(e) => { e.stopPropagation() }}>
                                <View style={[styles.modal, styles.modal_auto, modalStyle]}>
                                    {draggable && (
                                        <TouchableWithoutFeedback onPress={hide}>
                                            <View style={styles.containerDrag}>
                                                <View style={styles.dragIndicator}></View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )}
                                    <SafeAreaView style={styles.bodyContainer}>
                                        {!!title && <Text level={3} weight="bold" style={styles.title}>{title}</Text>}
                                        {children}
                                    </SafeAreaView>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </View >
            )
            break;
    }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={_visible}
            onShow={onShow}
            onRequestClose={onClose}
            onDismiss={onClose}
        >
            {content}
        </Modal >
    );
}


