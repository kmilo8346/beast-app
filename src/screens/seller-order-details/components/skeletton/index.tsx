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
  return (
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <View
        style={[
          { flexDirection: 'row', marginBottom: 20 },
          globalStyles.withMargin,
        ]}
      >
        <Bone width={50} height={50} borderRadius={100} />
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Bone height={30} width={100} style={{ marginBottom: 5 }} />
          <Bone height={30} width={150} />
        </View>
      </View>
    </View>
  );
};
