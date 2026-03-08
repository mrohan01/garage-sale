import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useListing, useSaveListing, useUnsaveListing } from '../../hooks';
import { PhotoCarousel, ClaimButton } from '../../components';
import type { HomeStackParamList } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'ListingDetail'>;

function getPriceColor(current: number, starting: number): string {
  const ratio = current / starting;
  if (ratio >= 0.75) return '#4CAF50';
  if (ratio >= 0.4) return '#FF9800';
  return '#F44336';
}

export function ListingDetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params;
  const userId = useAuthStore((s) => s.userId);
  const { data: listing, isLoading, isError } = useListing(listingId);
  const { mutate: save } = useSaveListing();
  const { mutate: unsave } = useUnsaveListing();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (isError || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Listing not found</Text>
      </View>
    );
  }

  const priceColor = getPriceColor(listing.currentPrice, listing.startingPrice);
  const isOwner = listing.saleId && userId; // simplified check

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PhotoCarousel images={listing.images ?? []} />

        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>

          <View style={styles.priceSection}>
            <Text style={[styles.currentPrice, { color: priceColor }]}>
              ${listing.currentPrice.toFixed(2)}
            </Text>
            {listing.currentPrice < listing.startingPrice && (
              <Text style={styles.originalPrice}>
                ${listing.startingPrice.toFixed(2)}
              </Text>
            )}
          </View>

          {listing.minimumPrice > 0 && (
            <Text style={styles.minPrice}>
              Min price: ${listing.minimumPrice.toFixed(2)}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{listing.category}</Text>
            </View>
            {listing.condition && (
              <View style={[styles.badge, styles.conditionBadge]}>
                <Text style={styles.badgeText}>{listing.condition.replace('_', ' ')}</Text>
              </View>
            )}
            <View style={[styles.badge, styles.statusBadge]}>
              <Text style={styles.badgeText}>{listing.status}</Text>
            </View>
          </View>

          {listing.description ? (
            <Text style={styles.description}>{listing.description}</Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => save(listing.id)}
            >
              <Text style={styles.saveText}>♥ Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {listing.status === 'AVAILABLE' && (
        <View style={styles.claimContainer}>
          <ClaimButton
            price={listing.currentPrice}
            onPress={() =>
              (navigation as any).navigate('Claim', {
                listingId: listing.id,
                listing,
              })
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  errorText: { fontSize: 16, color: '#DC2626' },
  scrollContent: { paddingBottom: 100 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  priceSection: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  currentPrice: { fontSize: 28, fontWeight: '700' },
  originalPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through' },
  minPrice: { fontSize: 13, color: '#888', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  badge: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  conditionBadge: { backgroundColor: '#FFF3E0' },
  statusBadge: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#555' },
  description: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 12 },
  saveButton: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  saveText: { fontSize: 15, color: '#F44336', fontWeight: '600' },
  claimContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
});
