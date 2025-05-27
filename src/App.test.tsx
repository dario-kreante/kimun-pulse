import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders KimunPulse welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/¡Bienvenido a KimunPulse!/i);
  expect(welcomeMessage).toBeInTheDocument();
});

test('renders environment badge in development', () => {
  render(<App />);
  const environmentBadge = screen.getByText(/Desarrollo/i);
  expect(environmentBadge).toBeInTheDocument();
});
