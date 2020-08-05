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
  const deleteTag = (tag: string) => {
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
          position: 'relative',
          top: 12,
          right: 15,
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
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <View style={{ flex: 1 }}>
          <Input
            label={label}
            placeholder={placeHolder}
            value={tag}
            errors={errors}
            clearButtonMode="never"
            suffix={add}
            style={{ marginBottom: -20 }}
            // suffixStyle={{ minHeight: 30, minWidth: 65, marginTop: 8 }}
            onChangeText={changeTagHandler}
          />
        </View>
      </View>
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
                marginTop: 5,
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
                onPress={(event) => {
                  event.stopPropagation();

                  deleteTag(tag);
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};
