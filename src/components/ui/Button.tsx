import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

export type ButtonVariant = 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

interface ButtonProps {
  children?: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  style,
  textStyle,
  disabled = false,
  loading = false,
}) => {
  const getContainerStyle = () => {
    let s: ViewStyle[] = [styles.base];
    if (size === 'sm') s.push(styles.sm);
    else if (size === 'lg') s.push(styles.lg);
    else if (size === 'icon') s.push(styles.icon);
    else s.push(styles.defaultSize);

    if (variant === 'outline') s.push(styles.outline);
    else if (variant === 'ghost') s.push(styles.ghost);
    else if (variant === 'secondary') s.push(styles.secondary);
    else if (variant === 'destructive') s.push(styles.destructive);
    else s.push(styles.default);

    if (disabled || loading) s.push(styles.disabled);
    return s;
  };

  const getLabelStyle = () => {
    let s: TextStyle[] = [styles.textBase];
    if (size === 'sm') s.push(styles.textSm);
    else if (size === 'lg') s.push(styles.textLg);

    if (variant === 'outline' || variant === 'ghost') s.push(styles.textOutline);
    else if (variant === 'secondary') s.push(styles.textSecondary);
    else if (variant === 'destructive') s.push(styles.textDestructive);
    else s.push(styles.textDefault);

    return s;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[...getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : typeof children === 'string' ? (
        <Text style={[...getLabelStyle(), textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  defaultSize: {
    height: 44,
    paddingHorizontal: 16,
  },
  sm: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  lg: {
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 0,
  },
  default: {
    backgroundColor: '#323746',
    borderWidth: 1,
    borderColor: '#42485C',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#323746',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#272A35',
  },
  destructive: {
    backgroundColor: '#991B1B',
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '700',
    fontSize: 14,
  },
  textSm: {
    fontSize: 12,
  },
  textLg: {
    fontSize: 16,
  },
  textDefault: {
    color: '#F4F5F8',
  },
  textOutline: {
    color: '#F4F5F8',
  },
  textSecondary: {
    color: '#D4D4D8',
  },
  textDestructive: {
    color: '#FFFFFF',
  },
});
