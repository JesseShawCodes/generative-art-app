import { render, screen, fireEvent } from "@testing-library/react";
import GalleryPanel from "../GalleryPanel";
import type { GalleryItem } from "@/lib/gallery";

const item: GalleryItem = {
  id: "g1",
  createdAt: "2026-01-01T00:00:00.000Z",
  algorithm: "circles",
  width: 800,
  height: 600,
  numElements: 40,
  seed: 99,
  paletteId: "bloom",
  customColors: [],
  thumbnail: "data:image/jpeg;base64,abc",
};

describe("GalleryPanel", () => {
  it("shows empty state", () => {
    render(
      <GalleryPanel
        items={[]}
        onSave={jest.fn()}
        onLoad={jest.fn()}
        onDelete={jest.fn()}
        canSave
      />,
    );
    expect(screen.getByText(/No saved compositions yet/i)).toBeInTheDocument();
  });

  it("saves, loads, and deletes", () => {
    const onSave = jest.fn();
    const onLoad = jest.fn();
    const onDelete = jest.fn();

    render(
      <GalleryPanel
        items={[item]}
        onSave={onSave}
        onLoad={onLoad}
        onDelete={onDelete}
        canSave
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Save to gallery/i }));
    expect(onSave).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /^Load$/i }));
    expect(onLoad).toHaveBeenCalledWith(item);

    fireEvent.click(screen.getByRole("button", { name: /^Delete$/i }));
    expect(onDelete).toHaveBeenCalledWith("g1");
  });
});
