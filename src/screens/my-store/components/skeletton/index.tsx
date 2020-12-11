import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Bone from '../../../../components/bone';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

export default () => {
  // render logic
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white, paddingTop: insets.top },
        globalStyles.withPadding,
      ]}
    >
      <View style={globalStyles.screenWithoutHeaderSpace} />
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <Bone
          width={100}
          height={100}
          borderRadius={100}
          style={{ marginBottom: 10 }}
        />
        <Bone width={150} height={30} style={{ marginBottom: 20 }} />
        <Bone height={60} />
      </View>

      {[1, 2, 3, 4, 5, 6].map((index) => (
        <View
          key={`${index}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Bone width={60} height={60} />
          <Bone height={60} style={{ flex: 1, marginLeft: 15 }} />
        </View>
      ))}
    </View>
  );
};
