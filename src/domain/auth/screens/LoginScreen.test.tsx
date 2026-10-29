import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import LoginScreen from '@/domain/auth/screens/LoginScreen';
import { rootReducer } from '@/store/rootReducer';

const renderLoginScreen = () =>
  render(
    <Provider store={configureStore({ reducer: rootReducer })}>
      <LoginScreen />
    </Provider>
  );

describe('LoginScreen', () => {
  it('shows required-field errors when submitted empty', async () => {
    await renderLoginScreen();

    await fireEvent.changeText(screen.getByLabelText('Email'), '');
    await fireEvent.changeText(screen.getByLabelText('Password'), '');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeOnTheScreen();
    expect(screen.getByText('Password is required')).toBeOnTheScreen();
  });

  it('shows the service error after a valid submit and stays on the screen', async () => {
    await renderLoginScreen();

    await fireEvent.changeText(screen.getByLabelText('Email'), 'helena.ruiz@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Incorrect email or password.')).toBeOnTheScreen();
  });
});
