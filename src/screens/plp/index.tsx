import React, { useReducer } from 'react';
import { View, SectionList, ViewStyle } from 'react-native';

import { ScreenView, Text } from '../../components';
import { ProductItem } from './components';
import { Item } from '../../types';
import { sections, Section } from './mock';
import globalStyle from '../../styles';
import colors from '../../styles/colors';
import styles from './styles';


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
        <ScreenView>
            <SectionList
                style={[styles.sections, globalStyle.withPadding]}
                stickySectionHeadersEnabled
                sections={state.sections}
                keyExtractor={(item, index) => `${index}-${item.id}`}
                renderItem={({ item, index, section }) => {
                    let style: ViewStyle = styles.item;
                    if (index === section.data.length - 1) {
                        style = styles.lastItem;
                    }
                    return <ProductItem data={item} onChange={(item) => { changeHandler(section.tag, item) }} onSeeDetail={seeDetailHandler} style={style} />
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