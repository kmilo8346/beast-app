import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import SimpleText from './SimpleText';
import BackArrow from './BackArrow';

const SelectionHeader = (props) => {
  const { selectItems } = props;
  const INITIAL_SELECTION = 'Depto 926';
  const [defaultSelection, setDefaultSelection] = useState(INITIAL_SELECTION);
  return (
    <View style={styles.container}>
      <BackArrow />
      <SimpleText text={defaultSelection} textStyles={styles.text} />
      <FontAwesomeIcon icon={faCaretDown} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    height: 75,
    width: 375,
  },
  text: {
    width: 93,
    height: 22,
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#171716',
    marginLeft: 115,
  },
});

export default SelectionHeader;
