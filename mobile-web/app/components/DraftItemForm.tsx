import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { CreateListingRequest, ListingCondition } from '../types';

interface DraftItemFormProps {
  onSubmit: (data: CreateListingRequest) => void;
  loading?: boolean;
}

export const DraftItemForm: React.FC<DraftItemFormProps> = ({ onSubmit, loading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateListingRequest>({
    defaultValues: {
      title: '',
      description: '',
      startingPrice: 0,
      minimumPrice: 0,
      category: '',
      condition: 'GOOD' as ListingCondition,
    },
  });

  const handleFormSubmit = (data: CreateListingRequest) => {
    onSubmit({
      ...data,
      startingPrice: Number(data.startingPrice),
      minimumPrice: Number(data.minimumPrice),
    });
    reset();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Item</Text>

      <Controller
        control={control}
        name="title"
        rules={{ required: 'Title is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Item title *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="category"
        rules={{ required: 'Category is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.category && styles.inputError]}
            placeholder="Category *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="startingPrice"
          rules={{ required: 'Price required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.halfInput, errors.startingPrice && styles.inputError]}
              placeholder="Starting price *"
              value={value ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="minimumPrice"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Min price"
              value={value ? String(value) : ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="decimal-pad"
            />
          )}
        />
      </View>

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Description (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={2}
          />
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleSubmit(handleFormSubmit)}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>+ Add Item</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#c62828',
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
