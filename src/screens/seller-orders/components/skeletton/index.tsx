import React from 'react';
import { View } from 'react-native';

// components
import Bone from '../../../../components/bone';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

export default () => {
  // render logic
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.white },
        globalStyles.withPadding,
      ]}
    >
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <Bone
          key={`${index}`}
          height={100}
          style={{ flex: 1, marginBottom: 10 }}
        />
      ))}
    </View>
  );
};
