import React from 'react';
import { Animated, View, Image, Dimensions, ScrollView } from 'react-native';

// styles
import styles from './styles';
import colors from '../../../styles/colors';

const deviceWidth = Dimensions.get('window').width;
const FIXED_BAR_WIDTH = 130;
const BAR_SPACE = 10;

export interface CarousellProps {
  images: string[];
}

const defaultImage = (
  <View
    style={{
      borderWidth: 3,
      borderStyle: 'solid',
      borderColor: colors.blackLight6,
      borderRadius: 10,
      backgroundColor: colors.blackLight7,
      width: 340,
    }}
    key="default"
  />
);

export default ({ images }: CarousellProps) => {
  const numItems = images.length;
  const itemWidth = FIXED_BAR_WIDTH / numItems - (numItems - 1) * BAR_SPACE;
  const animVal = new Animated.Value(0);

  const imageArray: any[] = [];
  const barArray: any[] = [];
  if (images.length === 0) {
    imageArray.push(defaultImage);
  } else {
    images.forEach((image, i) => {
      const thisImage = (
        <Image
          key={`image${i}`}
          source={{ uri: image }}
          style={[styles.image, { width: deviceWidth - 40 }]}
        />
      );
      imageArray.push(thisImage);

      const scrollBarVal = animVal.interpolate({
        inputRange: [
          (deviceWidth - 40) * (i - 1),
          (deviceWidth - 40) * (i + 1),
        ],
        outputRange: [-itemWidth, itemWidth],
        extrapolate: 'clamp',
      });

      const itemBar = (
        <View
          key={`bar${i}`}
          style={[
            styles.track,
            {
              width: itemWidth,
              marginLeft: i === 0 ? 0 : BAR_SPACE,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.bar,
              {
                width: itemWidth,
                transform: [{ translateX: scrollBarVal }],
              },
            ]}
          />
        </View>
      );
      barArray.push(itemBar);
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={10}
        pagingEnabled
        centerContent
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: animVal } } }],
          { useNativeDriver: false }
        )}
      >
        {imageArray}
      </ScrollView>
      <View style={styles.barContainer}>{barArray}</View>
    </View>
  );
};
