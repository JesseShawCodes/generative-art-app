import { render } from "@testing-library/react";
import { useCanvas } from "../CanvasContext";

function Probe() {
  useCanvas();
  return null;
}

describe("useCanvas", () => {
  it("throws outside a CanvasProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      /useCanvas must be used within a CanvasProvider/,
    );
    spy.mockRestore();
  });
});
