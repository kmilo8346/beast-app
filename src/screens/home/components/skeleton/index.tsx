import React from 'react';
import { Dimensions, View } from 'react-native';

// components
import Bone from '../../../../components/bone';
// styles
import globalStyles from '../../../../styles';

export default () => {
  const size = (Dimensions.get('window').width / 2 - 20) * 0.95;
  return (
    <View style={[{ paddingTop: 15 }, globalStyles.withMargin]}>
      <Bone
        width="100%"
        height={67}
        marginBottom={10}
        style={{ marginBottom: 15 }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15,
        }}
      >
        <Bone width={140} height={20} />
        <Bone width={70} height={20} />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <View style={{ width: '50%', marginBottom: 10 }}>
          <Bone
            width={size}
            height={size}
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
        <View style={{ width: '50%', marginBottom: 10 }}>
          <Bone width={size} height={size} style={{ alignSelf: 'flex-end' }} />
        </View>
        <View style={{ width: '50%', marginBottom: 10 }}>
          <Bone
            width={size}
            height={size}
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
        <View style={{ width: '50%', marginBottom: 10 }}>
          <Bone width={size} height={size} style={{ alignSelf: 'flex-end' }} />
        </View>
        <View style={{ width: '50%', marginBottom: 10 }}>
          <Bone
            width={size}
            height={size}
            style={{ alignSelf: 'flex-start' }}
          />
        </View>
        <View style={{ width: '50%', marginBottom: 10 }}>
          <Bone width={size} height={size} style={{ alignSelf: 'flex-end' }} />
        </View>
      </View>
    </View>
  );
};
