import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import type { ProfileStackParamList } from '../../types';
import { setupSms, confirmSms } from '../../services/api';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SMSSetup'>;

interface PhoneForm {
  phoneNumber: string;
}

interface CodeForm {
  code: string;
}

export function SMSSetupScreen({ navigation }: Props) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const phoneForm = useForm<PhoneForm>({ defaultValues: { phoneNumber: '' } });
  const codeForm = useForm<CodeForm>({ defaultValues: { code: '' } });

  const handleSendCode = async (data: PhoneForm) => {
    setLoading(true);
    setError(null);
    try {
      const result = await setupSms(data.phoneNumber);
      setChallengeId(result.challengeId);
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (data: CodeForm) => {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    try {
      await confirmSms(challengeId, data.code);
      setSuccess(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.successText}>SMS verification set up successfully!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>Set Up SMS Verification</Text>

      {step === 'phone' ? (
        <>
          <Text style={styles.description}>
            Enter your phone number to receive verification codes via SMS.
          </Text>

          <Controller
            control={phoneForm.control}
            name="phoneNumber"
            rules={{
              required: 'Phone number is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                mode="outlined"
                label="Phone Number"
                keyboardType="phone-pad"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!phoneForm.formState.errors.phoneNumber}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!phoneForm.formState.errors.phoneNumber}>
            {phoneForm.formState.errors.phoneNumber?.message}
          </HelperText>
          <HelperText type="error" visible={!!error}>{error}</HelperText>

          <Button
            mode="contained"
            onPress={phoneForm.handleSubmit(handleSendCode)}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Send Code
          </Button>
        </>
      ) : (
        <>
          <Text style={styles.description}>
            Enter the verification code sent to your phone.
          </Text>

          <Controller
            control={codeForm.control}
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
                autoFocus
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!codeForm.formState.errors.code}
                style={styles.input}
              />
            )}
          />
          <HelperText type="error" visible={!!codeForm.formState.errors.code}>
            {codeForm.formState.errors.code?.message}
          </HelperText>
          <HelperText type="error" visible={!!error}>{error}</HelperText>

          <Button
            mode="contained"
            onPress={codeForm.handleSubmit(handleVerify)}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Verify
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
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
});
