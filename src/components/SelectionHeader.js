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
    <View style={styles.container}>
      <View style={styles.navBar}>
        <BackArrow styles={styles.arrowBack} />
        <SimpleText text={defaultSelection} textStyles={styles.text} />
        <FontAwesomeIcon icon={faCaretDown} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: scale(96),
    width: scale(375),
    marginBottom: scale(16),
  },
  navBar: {
    flexDirection: 'row',
    width: '100%',
    marginTop: scale(58),
  },
  text: {
    width: scale(93),
    height: scale(22),
    fontSize: scale(18),
    fontWeight: '600',
    fontStyle: 'normal',
    letterSpacing: scale(0),
    color: '#171716',
    marginLeft: scale(101),
  },
  arrowBack: {
    marginLeft: scale(16),
  },
});

export default SelectionHeader;
