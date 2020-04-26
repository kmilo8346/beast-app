import React from 'react';
import { Image, View, FlatList, StyleSheet } from 'react-native';
import SimpleText from './SimpleText';
import ScheduleInfo from './ScheduleInfo';

const StoreItem = ({
  store: { title, openHour, closeHour, schedule, img },
}) => {
  return (
    <View style={styles.storeContainer}>
      <Image source={img} style={styles.imageBackground} />
      <View style={styles.imageContainer}>
        <SimpleText
          text={title}
          textStyles={{
            height: 29,
            fontSize: 28,
            fontWeight: '600',
            fontStyle: 'normal',
            letterSpacing: 0,
            color: '#ffffff',
            marginBottom: 50
          }}
        />
        <ScheduleInfo store={{openHour, closeHour, schedule}} />
      </View>
    </View>
  );
};
const StoresList = (props) => {
  const { data } = props;
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => <StoreItem store={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  storeContainer: {
    width: 343,
    height: 180,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  imageContainer: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 45,
    paddingBottom: 17,
    position: 'absolute',
  },
  infoContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    height: 34,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  hoursOpenContainer: {
    justifyContent: 'center',
    height: 28,
    borderRadius: 5,
    backgroundColor: '#ff9a3d',
    paddingHorizontal: 5,
  },
  daysOpenContainer: {
    justifyContent: 'center',
    height: 28,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    paddingHorizontal: 5,
  },
});

export default StoresList;
