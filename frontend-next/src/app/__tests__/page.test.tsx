import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "../page";
import { CanvasProvider } from "../CanvasContext";
import { generateArt } from "../../lib/api";
import { resetGalleryStoreForTests } from "../../lib/galleryStore";

jest.mock("../../lib/api", () => ({
  generateArt: jest.fn(),
}));

const mockedGenerateArt = jest.mocked(generateArt);

const sampleResponse = {
  algorithm: "circles" as const,
  seed: 1,
  width: 800,
  height: 600,
  elements: [
    {
      type: "circle" as const,
      x: 10,
      y: 20,
      radius: 5,
      color: "#ff507c",
      opacity: 1,
    },
  ],
};

function mockCanvas2d() {
  const context = {
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    globalAlpha: 1,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt",
  };
  jest
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(context as unknown as CanvasRenderingContext2D);
  jest
    .spyOn(HTMLCanvasElement.prototype, "toDataURL")
    .mockReturnValue("data:image/png;base64,test");
}

describe("Home", () => {
  beforeEach(() => {
    mockedGenerateArt.mockReset();
    mockedGenerateArt.mockResolvedValue(sampleResponse);
    window.localStorage.clear();
    resetGalleryStoreForTests();
    mockCanvas2d();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders studio controls, canvas, and gallery", async () => {
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
    expect(
      screen.getByRole("heading", { name: /Gallery/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save to gallery/i }),
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
