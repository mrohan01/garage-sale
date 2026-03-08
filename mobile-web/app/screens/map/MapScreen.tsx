import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar } from '../../components';
import { useMapSales } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import type { MapStackParamList } from '../../types';

const DEFAULT_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 10,
  longitudeDelta: 10,
};

type Props = NativeStackScreenProps<MapStackParamList, 'Map'>;

export function MapScreen({ navigation }: Props) {
  const [searchText, setSearchText] = useState('');
  const { latitude, longitude, requestLocation } = useLocationStore();

  useEffect(() => {
    if (latitude == null) {
      requestLocation();
    }
  }, [latitude, requestLocation]);

  const initialRegion = useMemo<Region>(() => {
    if (latitude != null && longitude != null) {
      return {
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    return DEFAULT_REGION;
  }, [latitude, longitude]);

  const { data: sales } = useMapSales(latitude ?? undefined, longitude ?? undefined, 10);

  const handleCalloutPress = (saleId: string) => {
    navigation.navigate('SaleDetail', { saleId });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {(sales ?? []).map((sale) => (
          <Marker
            key={sale.id}
            coordinate={{
              latitude: sale.latitude,
              longitude: sale.longitude,
            }}
            title={sale.title}
          >
            <Callout onPress={() => handleCalloutPress(sale.id)}>
              <View style={styles.callout}>
                <View>
                  <React.Fragment>
                    {/* Callout content rendered by MapView internally */}
                  </React.Fragment>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.searchOverlay}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search sales on map..."
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  callout: {
    minWidth: 150,
    padding: 8,
  },
});
