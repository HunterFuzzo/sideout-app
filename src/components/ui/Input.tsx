import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  onClear?: () => void;
  showSearchIcon?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  onClear,
  showSearchIcon = false,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {showSearchIcon && <Search size={16} color="#8C90A2" style={styles.searchIcon} />}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64697E"
        style={[styles.input, showSearchIcon && { paddingLeft: 38 }, style]}
        {...props}
      />
      {value && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
          <X size={15} color="#8C90A2" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  input: {
    height: 44,
    backgroundColor: '#121522',
    borderWidth: 1,
    borderColor: '#1F2436',
    borderRadius: 14,
    paddingHorizontal: 14,
    color: '#F4F5F8',
    fontSize: 14,
    fontWeight: '500',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
    padding: 4,
  },
});
