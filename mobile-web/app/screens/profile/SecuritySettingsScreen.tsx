import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { List, Button, Text, ActivityIndicator, HelperText } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import type { ProfileStackParamList, VerificationMethod } from '../../types';
import { getVerificationMethods, removeVerificationMethod } from '../../services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SecuritySettings'>;

const METHOD_INFO: Record<string, { label: string; icon: string }> = {
  EMAIL_OTP: { label: 'Email Code', icon: 'email-outline' },
  SMS_OTP: { label: 'SMS Code', icon: 'cellphone-message' },
  TOTP: { label: 'Authenticator App', icon: 'shield-key-outline' },
};

export function SecuritySettingsScreen({ navigation }: Props) {
  const [methods, setMethods] = useState<VerificationMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVerificationMethods();
      setMethods(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to load methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMethods();
    });
    return unsubscribe;
  }, [navigation, fetchMethods]);

  const enabledMethods = methods.filter((m) => m.enabled);
  const availableMethods = methods.filter((m) => !m.enabled);

  const handleRemove = async (type: string) => {
    setRemoving(type);
    setError(null);
    try {
      await removeVerificationMethod(type);
      await fetchMethods();
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to remove method');
    } finally {
      setRemoving(null);
    }
  };

  const handleAdd = (type: string) => {
    if (type === 'TOTP') {
      navigation.navigate('TOTPSetup');
    } else if (type === 'SMS_OTP') {
      navigation.navigate('SMSSetup');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <HelperText type="error" visible={!!error} style={styles.error}>{error}</HelperText>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Active Methods</Text>
        <View style={styles.card}>
          {enabledMethods.map((method) => {
            const info = METHOD_INFO[method.type] ?? { label: method.type, icon: 'help-circle-outline' };
            return (
              <List.Item
                key={method.type}
                title={info.label}
                left={(props) => <List.Icon {...props} icon={info.icon} color={colors.primary} />}
                right={() =>
                  enabledMethods.length > 1 ? (
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleRemove(method.type)}
                      loading={removing === method.type}
                      disabled={removing !== null}
                      textColor={colors.error}
                    >
                      Remove
                    </Button>
                  ) : null
                }
                style={styles.listItem}
              />
            );
          })}
        </View>
      </View>

      {availableMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Add Method</Text>
          <View style={styles.card}>
            {availableMethods.map((method) => {
              const info = METHOD_INFO[method.type] ?? { label: method.type, icon: 'help-circle-outline' };
              if (method.type === 'EMAIL_OTP') return null;
              return (
                <List.Item
                  key={method.type}
                  title={`Set up ${info.label}`}
                  left={(props) => <List.Icon {...props} icon={info.icon} color={colors.textSecondary} />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" color={colors.textMuted} />}
                  onPress={() => handleAdd(method.type)}
                  style={styles.listItem}
                />
              );
            })}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  error: {
    textAlign: 'center',
    fontSize: 14,
  },
});
