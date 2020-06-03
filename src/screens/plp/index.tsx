import React, { useReducer } from 'react';
import { View, SectionList, ViewStyle } from 'react-native';

import { ScreenView, Text } from '../../components';
import { ProductItem } from './components';
import { Item } from '../../types';
import { sections, Section } from './mock';
import styles from './styles';
import colors from '../../styles/colors';


type Action = { type: 'change', tag: string, item: Item };
type State = { sections: Section[] }

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'change':
            return {
                sections: state.sections.map(section => {
                    if (section.tag === action.tag) {
                        section.data = section.data.map(item => {
                            if (item.id === action.item.id) {
                                return action.item;
                            }
                            return item;
                        })
                    }
                    return section;
                })
            };
        default:
            throw new Error();
    }
}

export interface PLPScreenProps {
    navigation: any
}

export default ({ navigation }: PLPScreenProps) => {
    const [state, dispatch] = useReducer(reducer, { sections });

    const changeHandler = (tag: string, item: Item) => dispatch({ type: 'change', tag, item })
    const seeDetailHandler = (item: Item) => { navigation.navigate('PDP', item) }
    return (
        <ScreenView withMargin style={{ justifyContent: "center" }}>
            <SectionList
                stickySectionHeadersEnabled
                sections={state.sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index, section }) => {
                    let style: ViewStyle = {};
                    if (index === section.data.length - 1) {
                        style = styles.lastItem;
                    }
                    return <ProductItem key={item.id} data={item} onChange={(item) => { changeHandler(section.tag, item) }} onSeeDetail={seeDetailHandler} style={style} />
                }
                }
                renderSectionHeader={({ section: { tag } }) => (
                    <View style={styles.tagContainer}>
                        <Text style={styles.tag} level={6} color={colors.blackLight2}>{tag}</Text>
                    </View>
                )}
            />


        </ScreenView>
    );
}

// {state.items.map(item => <ProductItem key={item.id} data={item} onChange={changeHandler} onSeeDetail={seeDetailHandler} />)}

{/* <View style={{ height: 30 }}></View>
<Button title="Llamar +56 9 64570608" icon="phone-call" />
<View style={{ height: 30 }}></View>
<Button title="Hacer Pedido" />
<View style={{ height: 30 }}></View>
<Button title="Cancelar" type="secondary" />
<View style={{ height: 30 }}></View>
<Button title="Vaciar carrito" type="link" /> */}