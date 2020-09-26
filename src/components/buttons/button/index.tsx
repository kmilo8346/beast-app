import React, { ReactNode } from 'react';
import { View, ViewStyle, ActivityIndicator } from 'react-native';

// components
import Touchable, { TouchableProps } from '../../touchable';
import Text from '../../text';
import Icon from '../../icon';
// styles
import colors from '../../../styles/colors';
import styles from './styles';

export interface ButtonProps extends Partial<TouchableProps> {
  title: string | ReactNode;
  icon?: string | ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loadingComponent?: ReactNode;
  type?: 'primary' | 'secondary' | 'link';
  children?: ReactNode;
}

export default ({
  title,
  icon,
  loading,
  disabled,
  loadingComponent = <ActivityIndicator color={colors.white} />,
  type = 'primary',
  ...otherProps
}: ButtonProps) => {
  const containerStyle = [styles.container];
  switch (type) {
    case 'secondary':
      containerStyle.push(styles.container_secondary);
      break;
    case 'link':
      containerStyle.push(styles.container_link);
      break;
    default:
      containerStyle.push(styles.container_primary);
      break;
  }
  const titleStyle = [];
  switch (type) {
    case 'secondary':
      titleStyle.push(styles.title_secondary);
      break;
    case 'link':
      titleStyle.push(styles.title_link);
      break;
    default:
      titleStyle.push(styles.title_primary);
      break;
  }
  if (disabled) {
    containerStyle.push(styles.container_disabled);
  }
  containerStyle.push(otherProps.style as ViewStyle);
  let titleComponent: ReactNode = (
    <Text level={5} weight="bold" style={titleStyle}>
      {title}
    </Text>
  );
  if (typeof title !== 'string') {
    titleComponent = title;
  }
  let iconComponent = null;
  if (icon) {
    if (typeof icon !== 'string') {
      iconComponent = icon;
    } else {
      iconComponent = (
        <Icon name={icon} color={colors.white} style={styles.icon} />
      );
    }
  }

  return (
    <Touchable disabled={disabled} {...otherProps} style={containerStyle}>
      <View style={styles.iconContainer}>{iconComponent}</View>
      {titleComponent}
      <View style={styles.loadingContainer}>{loading && loadingComponent}</View>
    </Touchable>
  );
};
