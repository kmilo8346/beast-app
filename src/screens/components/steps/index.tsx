import React, { ReactNodeArray, ReactNode } from 'react';
import { View, TextStyle, StyleProp, ViewStyle } from 'react-native';

// components
import Text from '../../../components/text';
import Icon from '../../../components/icon';
// styles
import colors from '../../../styles/colors';

// instances outside component
const prefix = '[steps component]';
export type StepStatus = 'wait' | 'process' | 'finish';
type State = {
  label: string;
  status: StepStatus;
  active: boolean;
  old: boolean;
}[];
export interface Step {
  key: string;
  label: string;
}

export interface StepsProps {
  current: string;
  status: StepStatus;
  steps: Step[];
  style?: StyleProp<ViewStyle>;
}

export default ({ current, status, steps, style }: StepsProps) => {
  // render logic
  const activeIndex = steps.findIndex((step) => step.key === current);
  if (activeIndex === -1) {
    throw new Error(`${prefix} Invalid current, current: ${current}`);
  }
  if (['wait', 'process', 'finish'].indexOf(status) === -1) {
    throw new Error(`${prefix} Invalid status, status: ${status}`);
  }
  const state: State = steps.map((step, index) => {
    let s: StepStatus = 'wait';
    let active = false;
    let old = false;
    if (step.key === current) {
      s = status;
      active = true;
    }
    if (index < activeIndex) {
      s = 'finish';
      old = true;
    }

    return {
      label: step.label,
      status: s,
      active,
      old,
    };
  });
  const widgets: ReactNodeArray = [];
  const labels: ReactNodeArray = [];
  state.forEach((state, index, array) => {
    // add widget
    let widget: ReactNode | null = null;
    if (state.status === 'wait') {
      widget = (
        <View
          key={`widget-${index}`}
          style={{
            height: 20,
            width: 20,
            backgroundColor: colors.blackLight6,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              height: 7,
              width: 7,
              backgroundColor: colors.blue,
              borderRadius: 50,
            }}
          />
        </View>
      );
    } else if (state.status === 'process') {
      widget = (
        <View
          key={`widget-${index}`}
          style={{
            height: 32,
            width: 32,
            backgroundColor: colors.blue,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              height: 7,
              width: 7,
              backgroundColor: colors.white,
              borderRadius: 50,
            }}
          />
        </View>
      );
    } else {
      widget = (
        <View
          key={`widget-${index}`}
          style={{
            height: 32,
            width: 32,
            backgroundColor: colors.blue,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="check" color={colors.white} />
        </View>
      );
    }
    widgets.push(widget);

    // add bar
    if (index < array.length - 1) {
      widgets.push(
        <View
          key={`bar-${index}`}
          style={{
            flex: 1,
            height: 5,
            backgroundColor: state.old ? colors.blueLight2 : colors.blackLight7,
          }}
        />
      );
    }

    // add label
    const labelStyle: StyleProp<TextStyle> = {
      flex: 1,
      textAlign: 'center',
      color: colors.blackLight4,
    };
    if (index === 0) {
      labelStyle.textAlign = 'left';
    } else if (index === array.length - 1) {
      labelStyle.textAlign = 'right';
    }
    if (state.active) {
      labelStyle.color = colors.blue;
      labelStyle.fontWeight = 'bold';
    }
    labels.push(
      <Text key={`label-${index}`} level={7} style={labelStyle}>
        {state.label}
      </Text>
    );
  });
  return (
    <View style={{ alignSelf: 'stretch' }}>
      <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
        {widgets}
      </View>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
      >
        {labels}
      </View>
    </View>
  );
};
