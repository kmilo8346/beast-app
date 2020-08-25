import React, { ReactNode } from 'react';
import { View } from 'react-native';

// components
import Bone from '../../../../components/bone';
import Divider from '../../../../components/divider';
// styles
import colors from '../../../../styles/colors';
import globalStyles from '../../../../styles';

export default () => {
  // render logic
  const renderItem = (hasBadge = false, hasDivider = true) => {
    let badge: ReactNode | null = null;
    if (hasBadge) {
      badge = (
        <View
          style={{
            position: 'absolute',
            left: -3,
            top: -3,
            height: 18,
            width: 18,
            backgroundColor: colors.blue,
            borderRadius: 100,
          }}
        />
      );
    }
    let divider: ReactNode | null = <Divider />;
    if (!hasDivider) {
      divider = null;
    }
    return (
      <View>
        <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
          <View style={{ position: 'relative' }}>
            <Bone width={50} height={50} borderRadius={9} />
            {badge}
          </View>
          <View style={{ flex: 1, marginHorizontal: 10, paddingTop: 2 }}>
            <Bone width={156} marginBottom={7} />
            <Bone width={129} marginBottom={7} />
            <Bone width={53} />
          </View>
          <View style={{ paddingTop: 5 }}>
            <Bone width={94} height={30} borderRadius={8} />
          </View>
        </View>
        {divider}
      </View>
    );
  };

  return (
    <View
      style={[
        {
          flex: 1,
          paddingTop: 20,
        },
        globalStyles.withPadding,
      ]}
    >
      {renderItem(true, true)}
      {renderItem(true, true)}
      {renderItem(false, true)}
      {renderItem(false, true)}
      {renderItem(false, false)}
    </View>
  );
};
