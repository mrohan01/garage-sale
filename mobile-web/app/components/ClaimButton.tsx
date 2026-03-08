import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ClaimButtonProps {
  price: number;
  onPress: () => void;
  loading?: boolean;
}

export const ClaimButton: React.FC<ClaimButtonProps> = ({ price, onPress, loading }) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.text}>Claim for ${price.toFixed(2)}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  text: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
