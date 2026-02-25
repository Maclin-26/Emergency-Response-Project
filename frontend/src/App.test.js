import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SmartResponse AI title', () => {
  render(<App />);
  const titleElement = screen.getByText(/SmartResponse/i);
  expect(titleElement).toBeInTheDocument();
});