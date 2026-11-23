import { render, screen, fireEvent } from "@testing-library/react";
import Home from "../page";
import { CanvasProvider } from "../CanvasContext";
import { generateArt } from "../../lib/api";

jest.mock("../../lib/api", () => ({
  generateArt: jest.fn(),
}));

const mockedGenerateArt = jest.mocked(generateArt);

const emptyResponse = {
  algorithm: "circles" as const,
  seed: 1,
  width: 800,
  height: 600,
  elements: [],
};

describe("Home", () => {
  beforeEach(() => {
    mockedGenerateArt.mockReset();
    mockedGenerateArt.mockResolvedValue(emptyResponse);
  });

  it("renders a button", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /Generate New Art/i,
    });

    expect(button).toBeInTheDocument();
    expect(screen.getByLabelText(/Algorithm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Seed$/i)).toBeInTheDocument();
  });

  it("surfaces API errors to the user", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    const generateButton = await screen.findByRole("button", {
      name: /Generate New Art/i,
    });

    mockedGenerateArt.mockRejectedValueOnce(
      new Error("NEXT_PUBLIC_API_URL is not set"),
    );
    fireEvent.click(generateButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /NEXT_PUBLIC_API_URL is not set/,
    );
  });
});
