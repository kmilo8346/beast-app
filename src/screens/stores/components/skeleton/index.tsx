import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';

// components
import Bone from '../../../../components/bone';

export default () => {
  // state
  const [size] = useState((Dimensions.get('window').width * 0.98 - 20 * 2) / 2);

  // render logic
  return (
    <View>
      <View style={[{ marginLeft: 20, marginBottom: 20 }]}>
        <Bone width="40%" height={30} style={[{ marginBottom: 15 }]} />
        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          <Bone width={size} height={size} style={{ marginRight: 3 }} />
          <Bone width={size} height={size} />
        </View>
      </View>
      <View style={[{ marginLeft: 20, marginBottom: 20 }]}>
        <Bone width="40%" height={30} style={[{ marginBottom: 15 }]} />
        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          <Bone width={size} height={size} style={{ marginRight: 3 }} />
          <Bone width={size} height={size} />
        </View>
      </View>
    </View>
  );
};
