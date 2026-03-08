import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '../../app/components/SearchBar';

describe('SearchBar', () => {
  it('renders input with placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={() => {}} placeholder="Search..." />,
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('uses default placeholder when none provided', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={() => {}} />,
    );
    expect(getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('calls onChangeText on input', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} placeholder="Search..." />,
    );
    fireEvent.changeText(getByPlaceholderText('Search...'), 'test');
    expect(onChangeText).toHaveBeenCalledWith('test');
  });

  it('shows clear button when text entered', () => {
    const { getByText } = render(
      <SearchBar value="hello" onChangeText={() => {}} />,
    );
    expect(getByText('✕')).toBeTruthy();
  });

  it('does not show clear button when empty', () => {
    const { queryByText } = render(
      <SearchBar value="" onChangeText={() => {}} />,
    );
    expect(queryByText('✕')).toBeNull();
  });

  it('clears text when clear pressed', () => {
    const onChangeText = jest.fn();
    const { getByText } = render(
      <SearchBar value="hello" onChangeText={onChangeText} />,
    );
    fireEvent.press(getByText('✕'));
    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
