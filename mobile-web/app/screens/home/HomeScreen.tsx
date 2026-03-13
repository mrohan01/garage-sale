import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar, SaleCard, EmptyState, LoadingScreen } from '../../components';
import { useNearbySales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import { colors } from '../../theme';
import type { HomeStackParamList, Sale } from '../../types';

const DEFAULT_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const { latitude, longitude, isLoading: locationLoading, requestLocation } = useLocationStore();
  const flatListRef = useRef<FlatList<Sale>>(null);
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<Record<string, any>>({});

  useEffect(() => {
    if (latitude == null && !locationLoading) {
      requestLocation();
    }
  }, [latitude, locationLoading, requestLocation]);

  const {
    data: nearbySales,
    isLoading,
    refetch,
    isRefetching,
  } = useNearbySales(latitude ?? undefined, longitude ?? undefined, 10);

  const isSearching = searchText.trim().length > 0;

  const searchFilteredSales = useMemo(() => {
    const sales = nearbySales ?? [];
    if (!isSearching) return sales;
    const query = searchText.toLowerCase();
    return sales.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query),
    );
  }, [nearbySales, searchText, isSearching]);

  const displayedSales = useMemo(() => {
    if (isSearching) return searchFilteredSales;
    if (!mapRegion) return searchFilteredSales;
    const latDelta = mapRegion.latitudeDelta / 2;
    const lngDelta = mapRegion.longitudeDelta / 2;
    const north = mapRegion.latitude + latDelta;
    const south = mapRegion.latitude - latDelta;
    const east = mapRegion.longitude + lngDelta;
    const west = mapRegion.longitude - lngDelta;
    return searchFilteredSales.filter(
      (s) =>
        s.latitude >= south &&
        s.latitude <= north &&
        s.longitude >= west &&
        s.longitude <= east,
    );
  }, [searchFilteredSales, mapRegion, isSearching]);

  useEffect(() => {
    if (isSearching && searchFilteredSales.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
        searchFilteredSales.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
        { edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: true },
      );
    }
  }, [isSearching, searchFilteredSales]);

  const initialRegion = useMemo<Region>(() => {
    if (latitude != null && longitude != null) {
      return { latitude, longitude, latitudeDelta: 0.1, longitudeDelta: 0.1 };
    }
    return DEFAULT_REGION;
  }, [latitude, longitude]);

  const scrollToSale = useCallback(
    (saleId: string) => {
      const index = displayedSales.findIndex((s) => s.id === saleId);
      if (index >= 0) {
        try {
          flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        } catch {
          // ignore
        }
      }
    },
    [displayedSales],
  );

  const handleMarkerPress = useCallback(
    (saleId: string) => {
      setSelectedSaleId(saleId);
      scrollToSale(saleId);
    },
    [scrollToSale],
  );

  const handleCardPress = useCallback((saleId: string) => {
    setSelectedSaleId(saleId);
    const marker = markerRefs.current[saleId];
    if (marker) {
      marker.showCallout();
    }
  }, []);

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container} testID="home-screen">
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search sales and listings..."
        testID="search-input"
      />
      <View style={styles.mapContainer}>
        <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} onRegionChangeComplete={setMapRegion}>
          {searchFilteredSales.map((sale) => {
            const startsAt = new Date(sale.startsAt).toLocaleDateString();
            const endsAt = new Date(sale.endsAt).toLocaleDateString();
            return (
              <Marker
                key={sale.id}
                ref={(ref) => { if (ref) markerRefs.current[sale.id] = ref; }}
                coordinate={{ latitude: sale.latitude, longitude: sale.longitude }}
                onPress={() => handleMarkerPress(sale.id)}
              >
                <Callout
                  tooltip
                  onPress={() => navigation.navigate('SaleDetail', { saleId: sale.id })}
                >
                  <View style={styles.callout}>
                    <Text variant="titleSmall" style={styles.calloutTitle} numberOfLines={1}>
                      {sale.title}
                    </Text>
                    {sale.address ? (
                      <Text variant="bodySmall" style={styles.calloutAddress} numberOfLines={1}>
                        {sale.address}
                      </Text>
                    ) : null}
                    <Text variant="bodySmall" style={styles.calloutDates}>
                      {startsAt} – {endsAt}
                    </Text>
                    <Text variant="labelSmall" style={styles.calloutLink}>
                      View details →
                    </Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>
      <FlatList
        ref={flatListRef}
        data={displayedSales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedSaleId;
          return (
            <View style={[styles.cardWrapper, isSelected && styles.cardWrapperSelected]}>
              <SaleCard
              sale={item}
              onPress={() => handleCardPress(item.id)}
              onViewDetails={() => navigation.navigate('SaleDetail', { saleId: item.id })}
              />
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState
            message={searchText.trim() ? 'No results found' : 'No sales nearby'}
            testID={searchText.trim() ? 'search-empty' : undefined}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: 250,
  },
  map: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardWrapper: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  cardWrapperSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  callout: {
    minWidth: 200,
    maxWidth: 280,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calloutTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutAddress: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  calloutDates: {
    color: colors.textMuted,
    marginBottom: 4,
  },
  calloutLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
