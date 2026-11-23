import { render, screen, fireEvent } from "@testing-library/react";
import PalettePicker from "../PalettePicker";

describe("PalettePicker", () => {
  it("selects a preset palette", () => {
    const onPaletteIdChange = jest.fn();
    render(
      <PalettePicker
        paletteId="random"
        customColors={[]}
        onPaletteIdChange={onPaletteIdChange}
        onCustomColorsChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("option", { name: /Bloom/i }));
    expect(onPaletteIdChange).toHaveBeenCalledWith("bloom");
  });

  it("adds a custom color", () => {
    const onPaletteIdChange = jest.fn();
    const onCustomColorsChange = jest.fn();
    render(
      <PalettePicker
        paletteId="custom"
        customColors={[]}
        onPaletteIdChange={onPaletteIdChange}
        onCustomColorsChange={onCustomColorsChange}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Add color/i), {
      target: { value: "#112233" },
    });

    expect(onCustomColorsChange).toHaveBeenCalledWith(["#112233"]);
    expect(onPaletteIdChange).toHaveBeenCalledWith("custom");
  });
});
