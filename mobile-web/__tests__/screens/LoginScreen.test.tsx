import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

const mockNavigate = jest.fn();

jest.mock('../../app/services/api', () => ({
  loginStart: jest.fn(),
  loginSendCode: jest.fn(),
}));

import { LoginScreen } from '../../app/screens/auth/LoginScreen';

afterEach(() => {
  jest.useRealTimers();
});

function renderWithPaper(ui: React.ReactElement) {
  return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('LoginScreen', () => {
  const defaultProps: any = {
    navigation: { navigate: mockNavigate } as any,
    route: { params: undefined, key: 'Login', name: 'Login' as const },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input', () => {
    const { getAllByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getAllByText('Email').length).toBeGreaterThan(0);
  });

  it('renders continue button', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  it('renders register link', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    expect(getByText(/Don't have an account/)).toBeTruthy();
  });

  it('navigates to Register on link press', () => {
    const { getByText } = renderWithPaper(<LoginScreen {...defaultProps} />);
    fireEvent.press(getByText(/Don't have an account/));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});
