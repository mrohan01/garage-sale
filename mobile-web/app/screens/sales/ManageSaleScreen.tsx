import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  useSale,
  useListings,
  useActivateSale,
  useEndSale,
  useCreateListing,
  useDeleteListing,
  useUpdateListingStatus,
} from '../../hooks';
import { StatusBadge, EmptyState, LoadingScreen } from '../../components';
import { DraftItemForm } from '../../components/DraftItemForm';
import { WebContentWrapper } from '../../components/WebContentWrapper';
import { colors } from '../../theme';
import type { MySalesStackParamList, Listing, CreateListingRequest, RelistItem } from '../../types';

type Props = NativeStackScreenProps<MySalesStackParamList, 'ManageSale'>;

export function ManageSaleScreen({ route, navigation }: Props) {
  const { saleId } = route.params;
  const { data: sale, isLoading: saleLoading } = useSale(saleId);
  const { data: listings, isLoading: listingsLoading } = useListings(saleId);
  const { mutate: activate, isPending: activating } = useActivateSale();
  const { mutate: endSale, isPending: ending } = useEndSale();
  const { mutate: createListing, isPending: creating } = useCreateListing();
  const { mutate: deleteListing } = useDeleteListing();
  const { mutate: updateStatus } = useUpdateListingStatus();

  if (saleLoading || listingsLoading) {
    return <LoadingScreen />;
  }

  if (!sale) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Sale not found</Text>
      </View>
    );
  }

  const startsAt = new Date(sale.startsAt).toLocaleDateString();
  const endsAt = new Date(sale.endsAt).toLocaleDateString();
  const displayStatus = sale.status === 'ACTIVE' && new Date(sale.startsAt) > new Date()
    ? 'PENDING' as const
    : sale.status;
  const canEdit = sale.status === 'DRAFT' || sale.status === 'ACTIVE';
  const unsoldItems = (listings ?? []).filter((l) => l.status === 'AVAILABLE');

  const doEndSale = () => {
    endSale(saleId, {
      onSuccess: () => navigation.goBack(),
    });
  };

  const handleEndSale = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to end this sale?')) {
        doEndSale();
      }
    } else {
      Alert.alert('End Sale', 'Are you sure you want to end this sale?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Sale', style: 'destructive', onPress: doEndSale },
      ]);
    }
  };

  const handleMarkSold = (listing: Listing) => {
    updateStatus({ id: listing.id, saleId, status: 'SOLD' });
  };

  const handleRemoveListing = (listing: Listing) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove "${listing.title}" from this sale?`)) {
        deleteListing({ id: listing.id, saleId });
      }
    } else {
      Alert.alert('Remove Item', `Remove "${listing.title}" from this sale?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteListing({ id: listing.id, saleId }),
        },
      ]);
    }
  };

  const handleAddItem = (data: CreateListingRequest) => {
    createListing({ saleId, data });
  };

  const handleRelist = () => {
    const relistItems: RelistItem[] = unsoldItems.map((item) => ({
      title: item.title,
      description: item.description,
      startingPrice: item.startingPrice,
      minimumPrice: item.minimumPrice,
      category: item.category,
      condition: item.condition as any,
      imageUrls: item.images?.map((img) => img.imageUrl),
    }));
    navigation.navigate('CreateSale', {
      relistTitle: sale!.title,
      relistDescription: sale!.description,
      relistAddress: sale!.address ?? undefined,
      relistItems,
    });
  };

  const renderListingRow = ({ item }: { item: Listing }) => {
    const imageUrl = item.images?.[0]?.imageUrl;
    const hasDiscount = item.currentPrice < item.startingPrice;

    return (
      <View style={styles.listingRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Text variant="labelSmall" style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
        <View style={styles.listingInfo}>
          <Text variant="titleSmall" style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, hasDiscount && styles.priceDecayed]}>
              ${item.currentPrice.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${item.startingPrice.toFixed(2)}</Text>
            )}
          </View>
        </View>
        <View style={styles.listingActions}>
          {item.status === 'AVAILABLE' ? (
            <>
              <Button
                mode="contained"
                compact
                onPress={() => handleMarkSold(item)}
                style={styles.soldButton}
                labelStyle={styles.actionLabel}
              >
                Mark Sold
              </Button>
              <Button
                mode="outlined"
                compact
                onPress={() => handleRemoveListing(item)}
                style={styles.removeButton}
                textColor={colors.error}
                labelStyle={styles.actionLabel}
              >
                Remove
              </Button>
            </>
          ) : (
            <Chip
              compact
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    item.status === 'SOLD' ? colors.successLight : colors.background,
                },
              ]}
              textStyle={{
                color: item.status === 'SOLD' ? colors.success : colors.textMuted,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {item.status}
            </Chip>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <WebContentWrapper>
        <FlatList
          data={listings ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text variant="headlineSmall" style={styles.title}>
                    {sale.title}
                  </Text>
                  <StatusBadge status={displayStatus} />
                </View>
                <Text style={styles.dates}>{startsAt} – {endsAt}</Text>
                {sale.description ? (
                  <Text style={styles.description}>{sale.description}</Text>
                ) : null}
                {sale.address && (
                  <Text style={styles.address}>📍 {sale.address}</Text>
                )}
                {sale.status === 'DRAFT' && (
                  <Button
                    mode="contained"
                    style={styles.activateButton}
                    contentStyle={styles.actionButtonContent}
                    onPress={() => activate(saleId)}
                    disabled={activating}
                    loading={activating}
                  >
                    Activate Sale
                  </Button>
                )}
                {sale.status === 'ACTIVE' && (
                  <Button
                    mode="contained"
                    style={styles.endButton}
                    contentStyle={styles.actionButtonContent}
                    onPress={handleEndSale}
                    disabled={ending}
                    loading={ending}
                  >
                    End Sale
                  </Button>
                )}
                {(sale.status === 'ENDED' || sale.status === 'CANCELLED') && unsoldItems.length > 0 && (
                  <Button
                    mode="contained"
                    icon="refresh"
                    style={styles.relistButton}
                    contentStyle={styles.actionButtonContent}
                    onPress={handleRelist}
                  >
                    Relist {unsoldItems.length} Unsold Item{unsoldItems.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </View>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Items ({listings?.length ?? 0})
              </Text>
            </View>
          }
          renderItem={renderListingRow}
          ListEmptyComponent={<EmptyState message="No items listed yet" icon="📋" />}
          ListFooterComponent={
            canEdit ? (
              <View style={styles.formWrapper}>
                <DraftItemForm onSubmit={handleAddItem} loading={creating} />
              </View>
            ) : null
          }
        />
      </WebContentWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  dates: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  activateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginBottom: 4,
  },
  endButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    marginBottom: 4,
  },
  relistButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginBottom: 4,
  },
  actionButtonContent: {
    paddingVertical: 4,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 9,
  },
  listingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listingTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  priceDecayed: {
    color: colors.accent,
  },
  originalPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  listingActions: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soldButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  removeButton: {
    borderColor: colors.error,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 12,
  },
  statusChip: {
    borderRadius: 16,
  },
  formWrapper: {
    padding: 12,
    marginTop: 8,
  },
});
