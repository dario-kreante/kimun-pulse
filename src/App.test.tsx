import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders KimunPulse dashboard', () => {
  render(<App />);
  const dashboardElement = screen.getByText(/KimunPulse/i);
  expect(dashboardElement).toBeInTheDocument();
});