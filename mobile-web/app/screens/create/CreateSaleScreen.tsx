import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCreateSale } from '../../hooks';
import { useLocationStore } from '../../stores/useLocationStore';
import type { CreateSaleStackParamList, CreateSaleRequest } from '../../types';

type Props = NativeStackScreenProps<CreateSaleStackParamList, 'CreateSale'>;

export function CreateSaleScreen({ navigation }: Props) {
  const { latitude, longitude } = useLocationStore();
  const { mutate: createSale, isPending } = useCreateSale();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateSaleRequest>({
    defaultValues: {
      title: '',
      description: '',
      address: '',
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      startsAt: '',
      endsAt: '',
    },
  });

  const onSubmit = (data: CreateSaleRequest) => {
    const saleData = {
      ...data,
      latitude: data.latitude || latitude || 0,
      longitude: data.longitude || longitude || 0,
    };

    createSale(saleData, {
      onSuccess: (sale) => {
        navigation.replace('AddListings', { saleId: sale.id });
      },
      onError: (error) => {
        Alert.alert('Error', (error as Error).message ?? 'Failed to create sale');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Create a Garage Sale</Text>

        <Text style={styles.label}>Title *</Text>
        <Controller
          control={control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Moving Sale - Everything Must Go!"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

        <Text style={styles.label}>Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Describe your sale..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={3}
            />
          )}
        />

        <Text style={styles.label}>Address *</Text>
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Address is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              placeholder="123 Main St, City, State"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

        {latitude && longitude && (
          <Text style={styles.locationNote}>
            📍 Using your current location ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </Text>
        )}

        <Text style={styles.label}>Start Date/Time (ISO format) *</Text>
        <Controller
          control={control}
          name="startsAt"
          rules={{ required: 'Start date is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.startsAt && styles.inputError]}
              placeholder="2025-06-15T09:00:00"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.startsAt && <Text style={styles.errorText}>{errors.startsAt.message}</Text>}

        <Text style={styles.label}>End Date/Time (ISO format) *</Text>
        <Controller
          control={control}
          name="endsAt"
          rules={{ required: 'End date is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.endsAt && styles.inputError]}
              placeholder="2025-06-15T17:00:00"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.endsAt && <Text style={styles.errorText}>{errors.endsAt.message}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, isPending && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Sale & Add Items</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  inputError: { borderColor: '#e53935' },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  errorText: { color: '#e53935', fontSize: 13, marginTop: 4 },
  locationNote: { fontSize: 13, color: '#4CAF50', marginTop: 8 },
  submitButton: { backgroundColor: '#2196F3', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
