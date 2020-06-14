import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

import ButtonIcon from '../buttons/button-icon';
import Icon from '../icon';
import Text from '../text';
import Touchable from '../touchable';
import colors from '../../styles/colors';

export interface Option {
  key: string;
  title: string;
  subtitle: string;
}

export interface SelectProps {
  value: string;
  options: Option[];
  addMessage: string;
  dontDeleteOne?: boolean;
  style?: StyleProp<ViewStyle>;
  onSelect: (key: string) => void;
  onDelete: (key: string) => void;
  onAdd: () => void;
}

export default ({
  value,
  options,
  addMessage,
  dontDeleteOne = false,
  style = {},
  onSelect,
  onDelete,
  onAdd,
}: SelectProps) => {
  const containerStyle = [{ paddingLeft: 5 }, style];
  return (
    <View style={containerStyle}>
      {options.map((option, index, array) => {
        const isSelected = option.key === value;
        let selectIcon = <Icon name="circle" />;
        let deleteIcon = null;

        if (isSelected) {
          selectIcon = <Icon name="check-circle" />;
          deleteIcon = (
            <ButtonIcon
              icon="trash-2"
              onPress={(e) => {
                e.stopPropagation();
                onDelete(option.key);
              }}
            />
          );
          if (dontDeleteOne && array.length < 2) {
            deleteIcon = null;
          }
        }

        const optionStyle: StyleProp<ViewStyle> = [
          { flexDirection: 'row', marginBottom: 10 },
        ];
        if (index === array.length - 1) {
          optionStyle.push({ marginBottom: 12 });
        }
        return (
          <Touchable
            key={option.key}
            onPress={() => {
              onSelect(option.key);
            }}
            style={optionStyle}
          >
            {selectIcon}
            <View style={{ flex: 1, marginLeft: 18, marginRight: 10 }}>
              <Text
                level={6}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ marginBottom: 3 }}
              >
                {option.title}
              </Text>
              <Text
                level={6}
                color={colors.blackLight3}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {option.subtitle}
              </Text>
            </View>
            {deleteIcon}
          </Touchable>
        );
      })}
      {!!options.length && (
        <Touchable
          onPress={onAdd}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Icon name="plus" />
          <Text level={6} style={{ marginLeft: 18 }}>
            {addMessage}
          </Text>
        </Touchable>
      )}
    </View>
  );
};
