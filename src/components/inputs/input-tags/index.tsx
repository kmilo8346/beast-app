import React, { useState } from 'react';
import { View, GestureResponderEvent } from 'react-native';

// components
import Text from '../../text';
import Touchable from '../../touchable';
import ButtonIcon from '../../buttons/button-icon';
import Input from '../input';
import colors from '../../../styles/colors';

export interface InputTagsProps {
  value?: string[];
  label?: string;
  placeHolder?: string;
  size?: number;
  tip?: string;
  errors?: string[];
  onChange?: (value: string[]) => void;
}

export default ({
  label,
  placeHolder,
  value = [],
  size = 3,
  errors = [],
  onChange = () => null,
}: InputTagsProps) => {
  // state
  const [tag, setTag] = useState<string>('');

  // event handlers
  const changeTagHandler = (tag: string) => {
    setTag(tag);
  };
  const addTagHandler = (event: GestureResponderEvent) => {
    event.stopPropagation();
    const upperCaseTag = tag.toUpperCase();
    // do not repeat tags
    if (!value.some((i) => i === upperCaseTag)) {
      onChange([...value, upperCaseTag]);
    }
    // clear
    setTag('');
  };
  const deleteTagHandler = (event: GestureResponderEvent, tag: string) => {
    event.stopPropagation();
    onChange(value.filter((i: string) => i !== tag));
  };

  // render logic
  let add: JSX.Element | undefined;
  if (tag && value.length < size) {
    add = (
      <Touchable
        style={{
          borderColor: colors.blackLight5,
          borderStyle: 'solid',
          borderWidth: 1,
          borderRadius: 4,
          minWidth: 68,
          minHeight: 23,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'flex-end',
        }}
        onPress={addTagHandler}
      >
        <Text level={7} color={colors.blackLight2} weight="bold">
          Agregar
        </Text>
      </Touchable>
    );
  }
  return (
    <View>
      <Input
        label={label}
        placeholder={placeHolder}
        value={tag}
        errors={errors}
        clearButtonMode="never"
        suffix={add}
        containerStyle={{ justifyContent: 'center' }}
        onChangeText={changeTagHandler}
      />
      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 30 }}
      >
        {value.map((tag: string, index: number) => {
          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingLeft: 5,
                paddingRight: 3,
                backgroundColor: colors.blackLight6,
                borderColor: colors.blackLight5,
                borderStyle: 'solid',
                borderWidth: 1,
                borderRadius: 4,
                marginTop: -25,
                maxHeight: 20,
                marginRight: 5,
              }}
            >
              <Text level={6} weight="bold" color={colors.blackLight3}>
                {tag}
              </Text>
              <ButtonIcon
                icon="x"
                iconStyle={{ fontSize: 14, color: colors.blackLight3 }}
                style={{
                  padding: 2,
                  marginLeft: 5,
                }}
                onPress={(event) => deleteTagHandler(event, tag)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};
