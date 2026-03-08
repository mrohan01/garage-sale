import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCurrentUser } from '../../hooks';
import type { ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  label: string;
  route: keyof ProfileStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'My Sales', route: 'MySales' },
  { label: 'My Transactions', route: 'MyTransactions' },
  { label: 'Messages', route: 'Inbox' },
  { label: 'Settings', route: 'Settings' },
];

export function ProfileScreen({ navigation }: Props) {
  const { data: user, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {(error as Error)?.message ?? 'Failed to load profile'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          {user?.avatarUrl ? (
            <Text style={styles.avatarText}>
              {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Text style={styles.avatarText}>
              {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <Text style={styles.displayName}>{user?.displayName ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.trustScore ?? 50}</Text>
            <Text style={styles.statLabel}>Trust Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user?.reviewCount ?? 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {user?.averageRating ? user.averageRating.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
            ]}
            onPress={() => navigation.navigate(item.route as any)}
            activeOpacity={0.6}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2196F3',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#F0F0F0',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
  chevron: {
    fontSize: 22,
    color: '#CCC',
    fontWeight: '300',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});
