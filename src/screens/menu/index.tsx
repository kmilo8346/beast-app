import React from 'react';
import { ScrollView, View } from 'react-native';

import { Text, ScreenView } from '../../components';
import { Item } from './components';
import globalStyle from '../../styles'
import styles from "./styles";

export interface Props {
}

export default ({ }: Props) => {
    return (
        <ScreenView safeArea withFakeHeader>
            <Text level={1} weight="bold" style={globalStyle.withMargin}>Menú</Text>
            <ScrollView style={globalStyle.withPadding}>
                <View style={styles.space1}></View>
                <Item name="Cuenta" description="Correo, email, medios de pagos, dirección" onPress={() => { }}></Item>
                <Item name="Compras" description="Historial de compras" onPress={() => { }}></Item>
                <Item name="Ayuda" description="Preguntas frecuentes, tutoriales" onPress={() => { }}></Item>
                <View style={styles.space2}></View>
                <Item name="Negocio" description="Nombre, imagen, horario, despacho" onPress={() => { }}></Item>
                <Item name="Ventas" description="Historial de ventas" onPress={() => { }}></Item>
                <Item name="Mercado Pago" description="Retiro de ganancias, devoluciones, transferencias" icon="external-link" onPress={() => { }}></Item>
            </ScrollView>
        </ScreenView >
    );
}