import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export const LoadingScreen: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#2e7d32" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
});
