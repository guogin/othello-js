import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const titlElement = screen.getByText(/othello/i);
  expect(titlElement).toBeInTheDocument();
});

test('render who\'s turn', () => {
  render(<App />);
  const whosTurnElement = screen.getByText(/.*'s turn/i);
  expect(whosTurnElement).toBeInTheDocument();
})

test('game status', () => {
  render(<App />);
  const blackStone = screen.getByText(/blacks:\s*\d+/i);
  expect(blackStone).toBeInTheDocument();
  const whiteStone = screen.getByText(/whites:\s*\d+/i);
  expect(whiteStone).toBeInTheDocument();
})
