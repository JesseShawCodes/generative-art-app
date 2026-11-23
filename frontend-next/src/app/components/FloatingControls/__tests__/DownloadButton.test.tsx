import { render, screen, fireEvent } from "@testing-library/react";
import DownloadButton from "../DownloadButton";
import { useCanvas } from "../../../CanvasContext";

jest.mock("../../../CanvasContext");

describe("DownloadButton", () => {
  it("renders the download button", () => {
    jest.mocked(useCanvas).mockReturnValue({
      canvasRef: { current: null },
      exportMetaRef: { current: null },
    });
    render(<DownloadButton />);
    const downloadButton = screen.getByTestId("download-button");
    expect(downloadButton).toBeInTheDocument();
  });

  it("triggers download on click with art filename", () => {
    const mockToDataURL = jest.fn().mockReturnValue("fake_data_url");
    const mockCanvasRef = {
      current: { toDataURL: mockToDataURL } as unknown as HTMLCanvasElement,
    };
    jest.mocked(useCanvas).mockReturnValue({
      canvasRef: mockCanvasRef,
      exportMetaRef: { current: { algorithm: "circles", seed: 42 } },
    });

    const createElementSpy = jest.spyOn(document, "createElement");
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<DownloadButton />);

    const downloadButton = screen.getByTestId("download-button");
    fireEvent.click(downloadButton);

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(mockToDataURL).toHaveBeenCalledWith("image/png");
    expect(clickSpy).toHaveBeenCalled();

    const anchor = createElementSpy.mock.results.find(
      (result) => result.value instanceof HTMLAnchorElement,
    )?.value as HTMLAnchorElement | undefined;
    expect(anchor?.download).toBe("pixelbloom-circles-42.png");

    createElementSpy.mockRestore();
    clickSpy.mockRestore();
  });
});
