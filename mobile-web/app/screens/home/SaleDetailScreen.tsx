import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSale, useListings, useActivateSale } from '../../hooks';
import { ListingCard, EmptyState, StatusBadge } from '../../components';
import type { HomeStackParamList, Listing } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'SaleDetail'>;

export function SaleDetailScreen({ route, navigation }: Props) {
  const { saleId } = route.params;
  const userId = useAuthStore((s) => s.userId);
  const { data: sale, isLoading: saleLoading } = useSale(saleId);
  const { data: listings, isLoading: listingsLoading } = useListings(saleId);
  const { mutate: activate, isPending: activating } = useActivateSale();

  if (saleLoading || listingsLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Sale not found</Text>
      </View>
    );
  }

  const isOwner = sale.sellerId === userId;
  const startsAt = new Date(sale.startsAt).toLocaleDateString();
  const endsAt = new Date(sale.endsAt).toLocaleDateString();

  const handleListingPress = (listing: Listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={listings ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{sale.title}</Text>
              <StatusBadge status={sale.status} />
            </View>
            <Text style={styles.dates}>{startsAt} – {endsAt}</Text>
            {sale.description ? (
              <Text style={styles.description}>{sale.description}</Text>
            ) : null}
            {sale.address && (
              <Text style={styles.address}>📍 {sale.address}</Text>
            )}
            {isOwner && sale.status === 'DRAFT' && (
              <TouchableOpacity
                style={styles.activateButton}
                onPress={() => activate(saleId)}
                disabled={activating}
              >
                <Text style={styles.activateText}>
                  {activating ? 'Activating...' : 'Activate Sale'}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.sectionTitle}>
              Items ({listings?.length ?? 0})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard listing={item} onPress={() => handleListingPress(item)} />
        )}
        ListEmptyComponent={<EmptyState message="No items listed yet" icon="📋" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  errorText: { fontSize: 16, color: '#DC2626' },
  header: { padding: 16, backgroundColor: '#FFFFFF', marginBottom: 8 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  dates: { fontSize: 14, color: '#888', marginBottom: 6 },
  description: { fontSize: 15, color: '#555', marginBottom: 8, lineHeight: 22 },
  address: { fontSize: 14, color: '#666', marginBottom: 12 },
  activateButton: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  activateText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1a1a1a', marginTop: 8 },
  listContent: { paddingBottom: 24 },
  row: { paddingHorizontal: 12, gap: 0 },
});
