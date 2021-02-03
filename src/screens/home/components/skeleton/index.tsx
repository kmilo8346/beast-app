import React, { useCallback, useState } from 'react';
import { Dimensions, View } from 'react-native';

// components
import Bone from '../../../../components/bone';
// styles
import globalStyles from '../../../../styles';

export default () => {
  // state
  const [size] = useState((Dimensions.get('window').width * 0.97 - 20 * 2) / 2);

  // render logic
  const renderSection = useCallback(
    () => (
      <View style={{ marginBottom: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 15,
          }}
        >
          <Bone width={size} height={35} />
        </View>
        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          <Bone width={size} height={size} style={{ marginRight: 3 }} />
          <Bone width={size} height={size} style={{ marginRight: 3 }} />
          <Bone width={size} height={size} />
        </View>
      </View>
    ),
    []
  );

  return (
    <View style={[{ paddingTop: 15 }, globalStyles.withMargin]}>
      {renderSection()}
      {renderSection()}
      {renderSection()}
    </View>
  );
};
