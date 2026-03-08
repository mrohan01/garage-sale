import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onPress }) => {
  const hasDiscount = listing.currentPrice < listing.startingPrice;
  const imageUrl = listing.images?.[0]?.imageUrl;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, hasDiscount && styles.priceDecayed]}>
            ${listing.currentPrice.toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>${listing.startingPrice.toFixed(2)}</Text>
          )}
        </View>
        <Text style={styles.category}>{listing.category}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
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
    color: '#2e7d32',
  },
  priceDecayed: {
    color: '#e65100',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  category: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
});
