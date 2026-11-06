import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const Card: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const CardHeader: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({ children, style }) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const CardDescription: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({ children, style }) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

export const CardContent: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({ children, style }) => (
  <View style={[styles.content, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121522',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F2436',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F5F8',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    color: '#8C90A2',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
