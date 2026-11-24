import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.body.removeAttribute("data-theme");
  });

  it("hydrates theme from localStorage after mount", async () => {
    window.localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });
    expect(document.body.getAttribute("data-theme")).toBe("dark");
  });

  it("toggles theme and persists to localStorage", async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Toggle/i }));

    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    });
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(document.body.getAttribute("data-theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: /Toggle/i }));
    await waitFor(() => {
      expect(screen.getByTestId("theme")).toHaveTextContent("light");
    });
    expect(window.localStorage.getItem("theme")).toBe("light");
  });

  it("ignores invalid stored theme values", async () => {
    window.localStorage.setItem("theme", "neon");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.body.getAttribute("data-theme")).toBe("light");
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("throws when useTheme is used outside a provider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeProbe />)).toThrow(
      /useTheme must be used within a ThemeProvider/,
    );
    spy.mockRestore();
  });
});
