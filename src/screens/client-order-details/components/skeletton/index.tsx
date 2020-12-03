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
    <View style={[{ flex: 1, backgroundColor: colors.white }]}>
      <View style={[{ marginVertical: 10 }, globalStyles.withMargin]}>
        <Bone height={80} width="100%" borderRadius={10} />
      </View>

      <View
        style={[{ marginTop: 10, marginBottom: 20 }, globalStyles.withMargin]}
      >
        <Bone height={80} width="100%" />
      </View>

      <View style={[globalStyles.withMargin]}>
        <Bone height={25} width={150} style={{ marginBottom: 20 }} />
        <Bone height={50} width="100%" style={{ marginBottom: 15 }} />
        <Bone height={50} width="100%" style={{ marginBottom: 15 }} />
        <Bone height={50} width="100%" style={{ marginBottom: 15 }} />
        <Bone height={50} width="100%" style={{ marginBottom: 15 }} />
      </View>
    </View>
  );
};
