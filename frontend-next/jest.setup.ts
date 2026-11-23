import '@testing-library/jest-dom'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  } as Response)
);

// jsdom doesn't implement canvas; provide only the methods the app calls.
const mockContext = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
} as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = jest.fn(
  () => mockContext
) as unknown as HTMLCanvasElement['getContext'];
