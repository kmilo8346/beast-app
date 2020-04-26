import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import SimpleText from './SimpleText';
import BackArrow from './BackArrow';
import { scale } from '../util';

const SelectionHeader = (props) => {
  const { selectItems } = props;
  const INITIAL_SELECTION = 'Depto 926';
  const [defaultSelection, setDefaultSelection] = useState(INITIAL_SELECTION);
  return (
    <View style={styles.selectionHeaderContainer}>
      <View style={styles.navBar}>
        <SimpleText text={defaultSelection} textStyles={styles.text} />
        <FontAwesomeIcon icon={faCaretDown} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionHeaderContainer: {
    height: scale(96),
    marginBottom: scale(56),
  },
  navBar: {
    flexDirection: 'row',
    width: '100%',
    marginTop: scale(58),
    alignItems: 'center',
  },
  text: {
    width: scale(93),
    height: scale(22),
    fontSize: scale(18),
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: scale(0),
    color: '#171716',
  },
});

export default SelectionHeader;
