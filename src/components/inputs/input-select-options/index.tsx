import React, { useState, useCallback } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';

// components
import Modal from '../../modals/modal';
import Input from '../input';
import Touchable from '../../touchable';
import Icon from '../../icon';
import Text from '../../text';
// styles
import colors from '../../../styles/colors';
import globalStyle from '../../../styles';

interface Option {
  key: string;
  title: string;
  subtitle?: string;
}

export interface InputSelectOptions {
  label?: string;
  placeholder?: string;
  value: string;
  errors?: string[];
  options: Option[];
  modalTitle: string;
  onChange?: (key: string) => void;
}

export default ({
  label,
  placeholder,
  value,
  options,
  errors,
  modalTitle,
  onChange = () => null,
}: InputSelectOptions) => {
  // state
  const [isVisible, setIsVisible] = useState(false);
  const currentOption = options.find((option) => option.key === value);
  const text = currentOption ? currentOption.title : undefined;

  // event handlers
  const inputTouchHandler = () => {
    setIsVisible(true);
  };
  const requestCloseHandler = useCallback(() => {
    setIsVisible((prevIsVisible) => !prevIsVisible);
  }, []);

  // render logic
  return (
    <View>
      <Touchable onPress={inputTouchHandler}>
        <Input
          label={label}
          placeholder={placeholder}
          value={text}
          suffix="chevron-down"
          editable={false}
          pointerEvents="none"
          errors={errors}
        />
      </Touchable>
      {isVisible && (
        <Modal
          type="auto"
          title={modalTitle}
          onRequestClose={requestCloseHandler}
        >
          <View style={globalStyle.withMargin}>
            {options.map((option) => {
              let selectIcon = <Icon name="circle" />;
              const titleStyle = { marginBottom: 25 };
              if (value === option.key) {
                selectIcon = <Icon name="check-circle" />;
              }
              if (option.subtitle) {
                titleStyle.marginBottom = 10;
              }
              return (
                <Touchable
                  key={option.key}
                  onPress={() => {
                    onChange(option.key);
                  }}
                  style={{ flexDirection: 'row' }}
                >
                  {selectIcon}
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 18,
                      marginRight: 10,
                    }}
                  >
                    <Text
                      level={6}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={titleStyle}
                    >
                      {option.title}
                    </Text>
                    {!!option.subtitle && (
                      <Text
                        level={6}
                        color={colors.blackLight3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {option.subtitle}
                      </Text>
                    )}
                  </View>
                </Touchable>
              );
            })}
          </View>
        </Modal>
      )}
    </View>
  );
};
