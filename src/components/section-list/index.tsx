import React from 'react';
import {
  SectionList,
  SectionListProps as RNSectionListProps,
} from 'react-native';

export interface SectionListProps extends RNSectionListProps<any> {
  onBeastEndReached?: () => void;
  onBeastEndReachedThreshold?: number;
}

export default ({
  onBeastEndReached = () => null,
  onBeastEndReachedThreshold = 20,
  onMomentumScrollEnd = () => null,
  ...otherProps
}: SectionListProps) => {
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
    <SectionList<any>
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
