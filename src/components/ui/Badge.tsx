import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'success':
        return styles.success;
      case 'destructive':
        return styles.destructive;
      case 'muted':
        return styles.muted;
      default:
        return styles.default;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'success':
        return styles.textSuccess;
      case 'destructive':
        return styles.textDestructive;
      case 'muted':
        return styles.textMuted;
      default:
        return styles.textDefault;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  default: {
    backgroundColor: 'rgba(255, 94, 30, 0.15)',
    borderColor: 'rgba(255, 94, 30, 0.3)',
  },
  textDefault: {
    color: '#FF5E1E',
  },
  secondary: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  textSecondary: {
    color: '#00D4FF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#292F45',
  },
  textOutline: {
    color: '#8C90A2',
  },
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  textSuccess: {
    color: '#10B981',
  },
  destructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  textDestructive: {
    color: '#EF4444',
  },
  muted: {
    backgroundColor: '#1A1E2E',
    borderColor: '#22283C',
  },
  textMuted: {
    color: '#8C90A2',
  },
});
