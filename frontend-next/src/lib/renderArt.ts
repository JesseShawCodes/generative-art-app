import type { ArtElement } from "@/types/art";

/** Draw backend-generated geometry onto a 2D canvas context. */
export function renderArt(
  context: CanvasRenderingContext2D,
  elements: ArtElement[],
  width: number,
  height: number,
): void {
  context.clearRect(0, 0, width, height);

  for (const element of elements) {
    context.save();
    context.globalAlpha = element.opacity ?? 1;

    switch (element.type) {
      case "circle": {
        context.beginPath();
        context.arc(element.x, element.y, element.radius, 0, Math.PI * 2, false);
        context.fillStyle = element.color;
        context.fill();
        break;
      }
      case "line": {
        context.beginPath();
        context.moveTo(element.x1, element.y1);
        context.lineTo(element.x2, element.y2);
        context.strokeStyle = element.color;
        context.lineWidth = element.thickness;
        context.lineCap = "round";
        context.stroke();
        break;
      }
      case "polygon": {
        const [first, ...rest] = element.points;
        if (!first || rest.length < 2) break;
        context.beginPath();
        context.moveTo(first.x, first.y);
        for (const point of rest) {
          context.lineTo(point.x, point.y);
        }
        context.closePath();
        if (element.filled) {
          context.fillStyle = element.color;
          context.fill();
        } else {
          context.strokeStyle = element.color;
          context.lineWidth = 1.5;
          context.stroke();
        }
        break;
      }
      default: {
        const _exhaustive: never = element;
        void _exhaustive;
      }
    }

    context.restore();
  }
}
