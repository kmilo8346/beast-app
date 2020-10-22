import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// components
import Bone from '../../../../../components/bone';
// styles
import globalStyles from '../../../../../styles';
import colors from '../../../../../styles/colors';

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
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ width: 50, alignItems: 'center' }}>
          <Bone width={40} height={40} borderRadius={10} />
        </View>
        <Bone
          height={30}
          borderRadius={10}
          style={{ marginLeft: 15, flex: 1 }}
        />
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
