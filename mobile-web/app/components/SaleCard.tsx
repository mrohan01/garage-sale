import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Sale } from '../types';
import { StatusBadge } from './StatusBadge';
import { colors } from '../theme';

interface SaleCardProps {
  sale: Sale;
  onPress: () => void;
  onViewDetails?: () => void;
}

export const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress, onViewDetails }) => {
  const startsAt = new Date(sale.startsAt).toLocaleDateString();
  const endsAt = new Date(sale.endsAt).toLocaleDateString();
  const displayStatus = sale.status === 'ACTIVE' && new Date(sale.startsAt) > new Date()
    ? 'PENDING' as const
    : sale.status;

  return (
    <Card style={styles.card} onPress={onPress} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={1}>
            {sale.title}
          </Text>
          <StatusBadge status={displayStatus} />
        </View>
        <Text variant="bodySmall" style={styles.address} numberOfLines={1}>
          {sale.address}
        </Text>
        <Text variant="bodySmall" style={styles.dates}>
          {startsAt} – {endsAt}
        </Text>
        {sale.description ? (
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {sale.description}
          </Text>
        ) : null}
        {onViewDetails && (
          <Pressable onPress={onViewDetails}>
            <Text variant="labelSmall" style={styles.viewDetails}>
              View details →
            </Text>
          </Pressable>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
    fontWeight: '700',
  },
  address: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dates: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  viewDetails: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
});
