import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ListingCard, EmptyState, LoadingScreen } from '../../components';
import { useSavedListings } from '../../hooks';
import { SavedStackParamList } from '../../types';

type Props = NativeStackScreenProps<SavedStackParamList, 'Saved'>;

export function SavedScreen({ navigation }: Props) {
  const {
    data: savedListings,
    isLoading,
    refetch,
    isRefetching,
  } = useSavedListings();

  const handleListingPress = useCallback(
    (listingId: string) => {
      navigation.navigate('ListingDetail', { listingId });
    },
    [navigation],
  );

  if (isLoading && !isRefetching) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedListings ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            onPress={() => handleListingPress(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <EmptyState message="No saved items yet" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
