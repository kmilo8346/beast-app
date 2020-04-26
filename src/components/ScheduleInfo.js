import React from 'react';
import { View, StyleSheet } from 'react-native';
import SimpleText from './SimpleText';
import { scale } from '../util';

const ScheduleInfo = ({
  store: { openHour, closeHour, schedule },
  styleSch,
}) => {
  return (
    <View style={[styles.infoContainer, { ...styleSch }]}>
      <View style={styles.hoursOpenContainer}>
        <SimpleText text={`${openHour} - ${closeHour}`} textStyles={{}} />
      </View>
      <View style={styles.daysOpenContainer}>
        <SimpleText text={schedule} textStyles={{}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    height: scale(24),
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: scale(20),
  },
  hoursOpenContainer: {
    justifyContent: 'center',
    height: '100%',
    borderRadius: scale(5),
    backgroundColor: '#ff9a3d',
    paddingHorizontal: scale(5),
  },
  daysOpenContainer: {
    justifyContent: 'center',
    height: '100%',
    borderRadius: scale(5),
    backgroundColor: '#ffffff',
    paddingHorizontal: scale(5),
    marginLeft: scale(16),
  },
});

export default ScheduleInfo;
