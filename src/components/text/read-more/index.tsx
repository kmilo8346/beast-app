import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

// components
import Text, { TextProps } from '../index';
import Touchable from '../../touchable';
// styles
import colors from '../../../styles/colors';

export interface ReadMoreProps extends TextProps {
  moreText?: string;
  lessText?: string;
}

export default ({
  moreText = 'Ver más',
  lessText = 'Ver menos',
  numberOfLines = 3,
  ...otherProps
}: ReadMoreProps) => {
  let executed = false;

  // state
  const [lines, setLines] = useState<number | undefined>();
  const [lengthMore, setLengthMore] = useState(false);

  // event handlers
  const toggleNumberOfLines = () => {
    setLines((prev) => (prev === numberOfLines ? undefined : numberOfLines));
  };

  const onTextLayout = useCallback((e) => {
    if (!executed) {
      executed = true;
      setLengthMore(e.nativeEvent.lines.length > numberOfLines);
      setLines(numberOfLines);
    }
  }, []);

  // render logic
  return (
    <View>
      <Text {...otherProps} numberOfLines={lines} onTextLayout={onTextLayout}>
        {otherProps.children}
      </Text>

      {lengthMore ? (
        <Touchable onPress={toggleNumberOfLines} style={{ marginTop: 3 }}>
          <Text level={6} weight="bold" color={colors.black}>
            {lines === numberOfLines ? moreText : lessText}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
};
