import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';

// components
import Bone from '../../../../components/bone';
import Divider from '../../../../components/divider';
// styles
import globalStyles from '../../../../styles';

export default () => {
  // state
  const [size] = useState((Dimensions.get('window').width * 0.8 - 20 * 2) / 2);

  // render logic
  return (
    <View>
      <View style={globalStyles.screenWithoutHeaderSpace} />
      <Bone
        width="30%"
        height={20}
        style={[{ marginBottom: 10 }, globalStyles.withMargin]}
      />
      <View style={globalStyles.withMargin}>
        <Bone width="70%" height={30} style={[{ marginBottom: 15 }]} />
      </View>

      <Divider type="thick" style={{ marginBottom: 20 }} />
      <View style={[{ marginLeft: 20, marginBottom: 20 }]}>
        <Bone width="70%" height={30} style={[{ marginBottom: 15 }]} />
        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          <Bone width={size} height={size} style={{ marginRight: 3 }} />
          <Bone width={size} height={size} style={{ marginRight: 3 }} />
          <Bone width={size} height={size} />
        </View>
      </View>
    </View>
  );
};
