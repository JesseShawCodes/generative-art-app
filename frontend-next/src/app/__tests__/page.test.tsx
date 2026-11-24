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
    expect(screen.getByLabelText(/Generation engine/i)).toBeInTheDocument();
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

  it("uses local generation by default without calling the API", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Save to gallery/i })).toBeEnabled();
    });
    expect(mockedGenerateArt).not.toHaveBeenCalled();
  });

  it("surfaces API errors in server mode", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    fireEvent.click(screen.getByRole("radio", { name: /^Server$/i }));

    await waitFor(() => {
      expect(mockedGenerateArt).toHaveBeenCalled();
    });

    mockedGenerateArt.mockRejectedValueOnce(
      new Error("NEXT_PUBLIC_API_URL is not set"),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Generate$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /NEXT_PUBLIC_API_URL is not set/,
    );
  });

  it("sends palette colors when using the server engine", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    fireEvent.click(screen.getByRole("radio", { name: /^Server$/i }));

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

  it("shows a scale control for flow field and sends it to the server", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    expect(screen.queryByLabelText(/Scale/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Algorithm/i), {
      target: { value: "flow_field" },
    });

    const scaleInput = await screen.findByLabelText(/Scale/i);
    expect(scaleInput).toHaveValue("0.012");

    fireEvent.change(scaleInput, { target: { value: "0.04" } });
    fireEvent.click(screen.getByRole("radio", { name: /^Server$/i }));

    await waitFor(() => {
      expect(mockedGenerateArt).toHaveBeenCalled();
    });

    const lastCall =
      mockedGenerateArt.mock.calls[mockedGenerateArt.mock.calls.length - 1]?.[0];
    expect(lastCall?.parameters).toEqual(
      expect.objectContaining({
        scale: 0.04,
        colors: expect.arrayContaining(["#ff507c"]),
      }),
    );
  });

  it("saves to gallery and can load a saved item back", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Save to gallery/i }),
      ).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /Save to gallery/i }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      /Saved to gallery/i,
    );

    fireEvent.click(await screen.findByRole("button", { name: /^Load$/i }));

    const seedValue = (screen.getByLabelText(/^Seed$/i) as HTMLInputElement)
      .value;
    expect(seedValue).toMatch(/^\d+$/);
  });

  it("clears the seed input when regenerating", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    const seedInput = screen.getByLabelText(/^Seed$/i) as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: "12345" } });
    expect(String(seedInput.value)).toBe("12345");

    fireEvent.click(screen.getByRole("button", { name: /Regenerate/i }));
    expect(String(seedInput.value)).toBe("");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Save to gallery/i }),
      ).toBeEnabled();
    });
  });

  it("ignores non-integer seed input when generating", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    fireEvent.change(screen.getByLabelText(/^Seed$/i), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Generate$/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Save to gallery/i }),
      ).toBeEnabled();
    });
  });

  it("reuses the last seed into the seed input", async () => {
    render(
      <CanvasProvider>
        <Home />
      </CanvasProvider>,
    );

    await screen.findByRole("button", { name: /^Generate$/i });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^reuse$/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /^reuse$/i }));
    const seedValue = (screen.getByLabelText(/^Seed$/i) as HTMLInputElement)
      .value;
    expect(seedValue).toMatch(/^\d+$/);
  });
});
