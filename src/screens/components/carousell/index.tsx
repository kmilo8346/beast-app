import React, { useState } from 'react';
import { View, Image, Dimensions, ScrollView } from 'react-native';

// components
import Text from '../../../components/text';
// styles
import styles from './styles';
import colors from '../../../styles/colors';

const deviceWidth = Dimensions.get('window').width;

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
  const [index, setIndex] = useState(1);
  const numItems = images.length;

  const imageArray: any[] = [];
  if (images.length === 0) {
    imageArray.push(defaultImage);
  } else {
    images.forEach((image, i) => {
      const thisImage = (
        <Image
          key={`image${i}`}
          source={{ uri: image }}
          style={[styles.image, { width: deviceWidth, resizeMode: 'contain' }]}
        />
      );
      imageArray.push(thisImage);
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
        onMomentumScrollEnd={(event) => {
          setIndex(
            Math.round(event.nativeEvent.contentOffset.x / deviceWidth) + 1
          );
        }}
      >
        {imageArray}
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          top: 10,
          right: 20,
          backgroundColor: colors.blackLight1,
          opacity: 0.8,
          paddingHorizontal: 7,
          paddingVertical: 5,
          borderRadius: 20,
          minWidth: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          level={6}
          color={colors.white}
          style={{ textAlign: 'center', letterSpacing: 1.2 }}
        >{`${index}/${numItems}`}</Text>
      </View>
    </View>
  );
};
