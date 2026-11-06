import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export const Separator: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.separator, style]} />
);

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#1E2336',
    width: '100%',
  },
});
