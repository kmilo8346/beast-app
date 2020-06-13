import React from 'react';
import { FlatList, FlatListProps as RNFlatListProps } from 'react-native';

export interface FlatListProps extends RNFlatListProps<any> {
  onBeastEndReached?: () => void;
  onBeastEndReachedThreshold?: number;
}

export default ({
  onBeastEndReached = () => null,
  onBeastEndReachedThreshold = 20,
  onMomentumScrollEnd = () => null,
  ...otherProps
}: FlatListProps) => {
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }: {
    layoutMeasurement: { height: number };
    contentOffset: { y: number };
    contentSize: { height: number };
  }) => {
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - onBeastEndReachedThreshold
    );
  };

  return (
    <FlatList<any>
      scrollEventThrottle={16}
      {...otherProps}
      onMomentumScrollEnd={(event) => {
        if (isCloseToBottom(event.nativeEvent)) {
          onBeastEndReached();
        }
        onMomentumScrollEnd(event);
      }}
    />
  );
};
