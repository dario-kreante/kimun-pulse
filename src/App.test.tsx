import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders KimunPulse application', () => {
  render(<App />);
  const appTitle = screen.getByText(/KimunPulse/i);
  expect(appTitle).toBeInTheDocument();
});

test('renders environment badge in development', () => {
  render(<App />);
  const environmentBadge = screen.getByText(/Desarrollo/i);
  expect(environmentBadge).toBeInTheDocument();
});
