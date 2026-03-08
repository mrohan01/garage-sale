import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SaleStatus } from '../types';

const STATUS_COLORS: Record<SaleStatus, { bg: string; text: string }> = {
  DRAFT: { bg: '#fff3e0', text: '#e65100' },
  ACTIVE: { bg: '#e8f5e9', text: '#2e7d32' },
  ENDED: { bg: '#f5f5f5', text: '#757575' },
  CANCELLED: { bg: '#ffebee', text: '#c62828' },
};

interface StatusBadgeProps {
  status: SaleStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
