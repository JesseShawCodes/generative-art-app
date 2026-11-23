import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  it("renders studio controls and canvas", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /^Generate$/i,
    });

    expect(button).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Regenerate/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Algorithm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Seed$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color palette/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Download PNG/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Download SVG/i }),
    ).toBeInTheDocument();
    expect(document.querySelector("canvas")).toBeInTheDocument();
  });

  it("surfaces API errors to the user", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    const generateButton = await screen.findByRole("button", {
      name: /^Generate$/i,
    });

    mockedGenerateArt.mockRejectedValueOnce(
      new Error("NEXT_PUBLIC_API_URL is not set"),
    );
    fireEvent.click(generateButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /NEXT_PUBLIC_API_URL is not set/,
    );
  });

  it("sends palette colors in the generate request", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });

    await waitFor(() => {
      expect(mockedGenerateArt).toHaveBeenCalled();
    });

    const firstCall = mockedGenerateArt.mock.calls[0]?.[0];
    expect(firstCall?.parameters).toEqual(
      expect.objectContaining({
        colors: expect.arrayContaining(["#ff507c"]),
      }),
    );
  });
});
