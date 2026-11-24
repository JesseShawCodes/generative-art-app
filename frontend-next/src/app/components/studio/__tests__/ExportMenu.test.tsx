import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ExportMenu from "../ExportMenu";
import type { ArtElement } from "@/types/art";

const artData: ArtElement[] = [
  { type: "circle", x: 1, y: 2, radius: 3, color: "#ff507c", opacity: 1 },
];

describe("ExportMenu", () => {
  it("downloads PNG from the canvas", () => {
    const toDataURL = jest.fn().mockReturnValue("data:image/png;base64,abc");
    const canvasRef = createRef<HTMLCanvasElement | null>();
    canvasRef.current = {
      toDataURL,
    } as unknown as HTMLCanvasElement;

    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <ExportMenu
        canvasRef={canvasRef}
        artData={artData}
        algorithm="circles"
        seed={99}
        width={100}
        height={80}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Download PNG/i }));

    expect(toDataURL).toHaveBeenCalledWith("image/png");
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("does nothing for PNG when canvas is missing", () => {
    const canvasRef = createRef<HTMLCanvasElement | null>();
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <ExportMenu
        canvasRef={canvasRef}
        artData={artData}
        algorithm="circles"
        seed={1}
        width={100}
        height={80}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Download PNG/i }));
    expect(clickSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("downloads SVG via downloadTextFile", () => {
    const canvasRef = createRef<HTMLCanvasElement | null>();
    const createObjectURL = jest.fn(() => "blob:svg");
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });
    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <ExportMenu
        canvasRef={canvasRef}
        artData={artData}
        algorithm="circles"
        seed={7}
        width={100}
        height={80}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Download SVG/i }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:svg");

    clickSpy.mockRestore();
  });

  it("disables SVG when there is no art", () => {
    const canvasRef = createRef<HTMLCanvasElement | null>();
    render(
      <ExportMenu
        canvasRef={canvasRef}
        artData={[]}
        algorithm="circles"
        seed={null}
        width={100}
        height={80}
      />,
    );

    expect(screen.getByRole("button", { name: /Download SVG/i })).toBeDisabled();
  });
});
