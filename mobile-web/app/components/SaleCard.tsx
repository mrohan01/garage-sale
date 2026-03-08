import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sale } from '../types';
import { StatusBadge } from './StatusBadge';

interface SaleCardProps {
  sale: Sale;
  onPress: () => void;
}

export const SaleCard: React.FC<SaleCardProps> = ({ sale, onPress }) => {
  const startsAt = new Date(sale.startsAt).toLocaleDateString();
  const endsAt = new Date(sale.endsAt).toLocaleDateString();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {sale.title}
        </Text>
        <StatusBadge status={sale.status} />
      </View>
      <Text style={styles.address} numberOfLines={1}>
        {sale.address}
      </Text>
      <Text style={styles.dates}>
        {startsAt} – {endsAt}
      </Text>
      {sale.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {sale.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  dates: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
});
