import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { TextInput, Button, Text, HelperText, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import type { ProfileStackParamList, TotpSetupResponse } from '../../types';
import { setupTotp, confirmTotp } from '../../services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'TOTPSetup'>;

interface TotpForm {
  code: string;
}

export function TOTPSetupScreen({ navigation }: Props) {
  const [setup, setSetup] = useState<TotpSetupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<TotpForm>({
    defaultValues: { code: '' },
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await setupTotp();
        setSetup(data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? err.message ?? 'Failed to set up authenticator');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (data: TotpForm) => {
    setConfirming(true);
    setError(null);
    try {
      await confirmTotp(data.code);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Invalid code');
    } finally {
      setConfirming(false);
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
      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Authenticator app set up successfully!</Text>
        </View>
      ) : (
        <>
          <Text style={styles.heading}>Set Up Authenticator App</Text>
          <Text style={styles.description}>
            Add this key to your authenticator app (e.g. Google Authenticator):
          </Text>

          {setup && (
            <View style={styles.card}>
              <Text style={styles.label}>Setup Key</Text>
              <Text style={styles.secretText} selectable>{setup.secret}</Text>
              <Text style={[styles.label, { marginTop: 16 }]}>Full URI</Text>
              <Text style={styles.uriText} selectable>{setup.qrUri}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="code"
            rules={{
              required: 'Code is required',
              pattern: {
                value: /^\d{6}$/,
                message: 'Enter a 6-digit code',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Verification Code"
                keyboardType="number-pad"
                maxLength={6}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.code}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.code}>{errors.code?.message}</HelperText>
          <HelperText type="error" visible={!!error}>{error}</HelperText>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={confirming}
            disabled={confirming}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Confirm
          </Button>
        </>
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
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  secretText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  uriText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonContent: {
    height: 48,
  },
  successContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
});
