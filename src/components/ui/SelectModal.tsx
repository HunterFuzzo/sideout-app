import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Check, X } from 'lucide-react-native';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={18} color="#8C90A2" />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = item.value === selectedValue;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={[styles.item, isSelected && styles.itemSelected]}
                      onPress={() => {
                        onSelect(item.value);
                        onClose();
                      }}
                    >
                      <Text
                        style={[styles.itemText, isSelected && styles.itemTextSelected]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && <Check size={18} color="#FF5E1E" />}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.list}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#121522',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingBottom: 36,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: '#242A3D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2436',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F4F5F8',
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#1A1E2E',
    borderRadius: 14,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginVertical: 3,
  },
  itemSelected: {
    backgroundColor: 'rgba(255, 94, 30, 0.12)',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8C90A2',
  },
  itemTextSelected: {
    color: '#FF5E1E',
    fontWeight: '700',
  },
});
