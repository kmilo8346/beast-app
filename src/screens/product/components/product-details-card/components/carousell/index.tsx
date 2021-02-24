import React, { useRef, useState } from 'react';
import {
  View,
  Dimensions,
  ScrollView,
  Modal,
  GestureResponderEvent,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// components
import Text from '../../../../../../components/text';
import Icon from '../../../../../../components/icon';
import Image from '../../../../../../components/image';
import Touchable from '../../../../../../components/touchable';
// styles
import styles from './styles';
import colors from '../../../../../../styles/colors';

// instances outside component
const deviceWidth = Dimensions.get('window').width;

export interface CarousellProps {
  images: string[];
}

export default ({ images }: CarousellProps) => {
  // state
  const [page, setPage] = useState(1);
  const [fullScreen, setFullScreen] = useState<{
    visible: boolean;
    index: number;
  }>({ visible: false, index: 0 });

  // event handlers
  const fullScreenModalRequestCloseHandler = () => {
    setFullScreen({ visible: false, index: 0 });
  };

  const closeButtonFullScreenModalPressHandler = (
    event: GestureResponderEvent
  ) => {
    event.stopPropagation();
    setFullScreen({ visible: false, index: 0 });
  };

  // render logic
  const totalPages = images.length;
  const ref = useRef<ScrollView>(null);
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={10}
        pagingEnabled
        centerContent
        onMomentumScrollEnd={(event) => {
          setPage(
            Math.round(event.nativeEvent.contentOffset.x / deviceWidth) + 1
          );
        }}
      >
        {images.map((image, index) => (
          <TouchableWithoutFeedback
            key={`${index}`}
            style={{ width: deviceWidth, height: 300 }}
            onPress={(event: GestureResponderEvent) => {
              event.stopPropagation();
              setFullScreen({ visible: true, index });
            }}
          >
            <Image
              source={{ uri: image }}
              style={{ width: deviceWidth, height: '100%' }}
            />
          </TouchableWithoutFeedback>
        ))}
      </ScrollView>
      {totalPages > 1 && (
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
          >{`${page}/${totalPages}`}</Text>
        </View>
      )}

      {fullScreen.visible && (
        <Modal
          statusBarTranslucent
          animationType="slide"
          onRequestClose={fullScreenModalRequestCloseHandler}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: colors.white,
              }}
            >
              <SafeAreaView>
                <Touchable
                  style={{
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                  }}
                  onPress={closeButtonFullScreenModalPressHandler}
                >
                  <Icon name="x" size={28} />
                </Touchable>
              </SafeAreaView>
            </View>

            <ScrollView
              ref={ref}
              horizontal
              pagingEnabled
              centerContent
              scrollEventThrottle={10}
              contentOffset={{ x: deviceWidth * fullScreen.index, y: 0 }}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1, backgroundColor: colors.white }}
              onContentSizeChange={() => {
                if (Platform.OS === 'android') {
                  ref.current?.scrollTo({
                    x: deviceWidth * fullScreen.index,
                    y: 0,
                    animated: false,
                  });
                }
              }}
            >
              {images.map((image, index) => (
                <Image
                  key={`${index}`}
                  source={{ uri: image }}
                  style={{
                    width: deviceWidth,
                    resizeMode: 'contain',
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
};
