import { ApiError, generateArt, isCircle } from '../api';
import type { Circle } from '@/types/art';

const request = { width: 800, height: 600, num_elements: 2 };

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  jest.mocked(global.fetch).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

describe('isCircle', () => {
  it('accepts a valid circle', () => {
    expect(isCircle({ x: 1, y: 2, radius: 3, color: '#fff' })).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isCircle(null)).toBe(false);
    expect(isCircle({ x: '1', y: 2, radius: 3, color: '#fff' })).toBe(false);
    expect(isCircle({ x: 1, y: 2, radius: 3 })).toBe(false);
    expect(isCircle({ x: NaN, y: 2, radius: 3, color: '#fff' })).toBe(false);
  });
});

describe('generateArt', () => {
  it('returns typed circles and posts the request body', async () => {
    const circles: Circle[] = [{ x: 1, y: 2, radius: 3, color: '#abcdef' }];
    mockFetchResponse(circles);

    await expect(generateArt(request)).resolves.toEqual(circles);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/generate-art'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(request) })
    );
  });

  it('throws a clear error when NEXT_PUBLIC_API_URL is missing', async () => {
    const original = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    try {
      await expect(generateArt(request)).rejects.toThrow(/NEXT_PUBLIC_API_URL/);
    } finally {
      process.env.NEXT_PUBLIC_API_URL = original;
    }
  });

  it('throws an ApiError on a non-OK response', async () => {
    mockFetchResponse(null, false, 500);

    await expect(generateArt(request)).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    });
  });

  it('throws an ApiError when the response shape is wrong', async () => {
    mockFetchResponse([{ nope: true }]);

    await expect(generateArt(request)).rejects.toBeInstanceOf(ApiError);
  });

  it('throws an ApiError when the response body is not JSON', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    } as Response);

    await expect(generateArt(request)).rejects.toMatchObject({
      name: 'ApiError',
      message: expect.stringMatching(/Invalid JSON/),
    });
  });
});
