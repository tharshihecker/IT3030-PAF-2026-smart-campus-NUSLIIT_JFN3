import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders home heading", () => {
  render(<App />);
  expect(screen.getByText(/home/i)).toBeInTheDocument();
});
