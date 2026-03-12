import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { colors } from '../theme';

interface DateTimePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: boolean;
  minimumDate?: Date;
}

function formatDateTime(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toLocalISOString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function WebDateTimePicker({ label, value, onChange, error, minimumDate }: DateTimePickerProps) {
  return (
    <View style={styles.webContainer}>
      <Text variant="bodySmall" style={styles.webLabel}>{label}</Text>
      <input
        type="datetime-local"
        value={value ? toLocalISOString(value) : ''}
        min={minimumDate ? toLocalISOString(minimumDate) : undefined}
        onChange={(e) => {
          const date = new Date(e.target.value);
          if (!isNaN(date.getTime())) onChange(date);
        }}
        style={{
          padding: 14,
          fontSize: 16,
          borderRadius: 5,
          border: `1px solid ${error ? colors.error : colors.border}`,
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          width: '100%',
          boxSizing: 'border-box' as const,
        }}
      />
    </View>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function NativeDateTimePicker({ label, value, onChange, error }: DateTimePickerProps) {
  const [visible, setVisible] = useState(false);
  const now = new Date();
  const [month, setMonth] = useState(value?.getMonth() ?? now.getMonth());
  const [day, setDay] = useState(value?.getDate() ?? now.getDate());
  const [year, setYear] = useState(value?.getFullYear() ?? now.getFullYear());
  const [hour, setHour] = useState(value ? (value.getHours() % 12 || 12) : 9);
  const [minute, setMinute] = useState(value?.getMinutes() ?? 0);
  const [ampm, setAmpm] = useState(value ? (value.getHours() >= 12 ? 'PM' : 'AM') : 'AM');

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() + i);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const openPicker = () => {
    if (value) {
      setMonth(value.getMonth());
      setDay(value.getDate());
      setYear(value.getFullYear());
      setHour(value.getHours() % 12 || 12);
      setMinute(value.getMinutes());
      setAmpm(value.getHours() >= 12 ? 'PM' : 'AM');
    }
    setVisible(true);
  };

  const handleConfirm = () => {
    let h = hour % 12;
    if (ampm === 'PM') h += 12;
    const clampedDay = Math.min(day, daysInMonth);
    const date = new Date(year, month, clampedDay, h, minute);
    onChange(date);
    setVisible(false);
  };

  return (
    <>
      <Pressable onPress={openPicker}>
        <TextInput
          mode="outlined"
          label={label}
          style={styles.input}
          value={formatDateTime(value)}
          editable={false}
          right={<TextInput.Icon icon="calendar-clock" onPress={openPicker} />}
          error={error}
        />
      </Pressable>
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleMedium" style={styles.modalTitle}>{label}</Text>

          <Text variant="labelMedium" style={styles.sectionLabel}>Date</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text variant="labelSmall" style={styles.colLabel}>Month</Text>
              <View style={styles.scrollCol}>
                {MONTHS.map((m, i) => (
                  <Pressable key={m} onPress={() => setMonth(i)} style={[styles.option, month === i && styles.optionSelected]}>
                    <Text style={[styles.optionText, month === i && styles.optionTextSelected]}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.column}>
              <Text variant="labelSmall" style={styles.colLabel}>Day</Text>
              <View style={styles.scrollCol}>
                {days.map((d) => (
                  <Pressable key={d} onPress={() => setDay(d)} style={[styles.option, day === d && styles.optionSelected]}>
                    <Text style={[styles.optionText, day === d && styles.optionTextSelected]}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.column}>
              <Text variant="labelSmall" style={styles.colLabel}>Year</Text>
              <View style={styles.scrollCol}>
                {years.map((y) => (
                  <Pressable key={y} onPress={() => setYear(y)} style={[styles.option, year === y && styles.optionSelected]}>
                    <Text style={[styles.optionText, year === y && styles.optionTextSelected]}>{y}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Text variant="labelMedium" style={styles.sectionLabel}>Time</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text variant="labelSmall" style={styles.colLabel}>Hour</Text>
              <View style={styles.scrollCol}>
                {HOURS.map((h) => (
                  <Pressable key={h} onPress={() => setHour(h)} style={[styles.option, hour === h && styles.optionSelected]}>
                    <Text style={[styles.optionText, hour === h && styles.optionTextSelected]}>{h}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.column}>
              <Text variant="labelSmall" style={styles.colLabel}>Min</Text>
              <View style={styles.scrollCol}>
                {MINUTES.map((m) => (
                  <Pressable key={m} onPress={() => setMinute(m)} style={[styles.option, minute === m && styles.optionSelected]}>
                    <Text style={[styles.optionText, minute === m && styles.optionTextSelected]}>{String(m).padStart(2, '0')}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.column}>
              <Text variant="labelSmall" style={styles.colLabel}> </Text>
              <View style={styles.scrollCol}>
                {['AM', 'PM'].map((p) => (
                  <Pressable key={p} onPress={() => setAmpm(p)} style={[styles.option, ampm === p && styles.optionSelected]}>
                    <Text style={[styles.optionText, ampm === p && styles.optionTextSelected]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setVisible(false)} style={styles.cancelButton}>Cancel</Button>
            <Button mode="contained" onPress={handleConfirm} buttonColor={colors.primary}>Confirm</Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

export const DateTimePicker = Platform.OS === 'web' ? WebDateTimePicker : NativeDateTimePicker;

const styles = StyleSheet.create({
  webContainer: {
    marginBottom: 4,
  },
  webLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },
  input: {
    marginBottom: 4,
    backgroundColor: colors.surface,
  },
  modal: {
    backgroundColor: colors.surface,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionLabel: {
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  colLabel: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  scrollCol: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    overflow: 'scroll' as any,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  optionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    borderColor: colors.border,
  },
});
