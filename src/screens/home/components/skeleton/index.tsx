import React from 'react';
import { View } from 'react-native';

// components
import Bone from '../../../../components/bone';
// styles
import globalStyles from '../../../../styles';

export default () => {
  return (
    <View style={{ paddingTop: 15 }}>
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
          },
          globalStyles.withMargin,
        ]}
      >
        <View style={{ marginTop: 5 }}>
          <Bone width={171} marginBottom={10} />
          <Bone width={205} />
        </View>
        <View>
          <Bone width={25} height={25} borderRadius={100} />
        </View>
      </View>

      <Bone borderRadius={0} marginBottom={15} />

      <View style={globalStyles.withMargin}>
        <Bone height={61} borderRadius={13} marginBottom={25} />
        <Bone width={200} marginBottom={25} />
        <Bone height={300} borderRadius={20} marginBottom={15} />
        <Bone width={200} marginLeft={15} marginBottom={12} />
        <Bone width={168} marginLeft={15} marginBottom={15} />
      </View>
    </View>
  );
};
