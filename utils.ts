const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const BASE = CHARACTERS.length;

/**
 * Generates a short URL code from a numeric ID using base62 encoding
 * @param id - The numeric ID to encode
 * @returns The base62 encoded string
 */
export function encodeId(id: number): string {
  let shortUrl = "";
  let num = id;
  while (num > 0) {
    shortUrl = CHARACTERS[num % BASE] + shortUrl;
    num = Math.floor(num / BASE);
  }
  return shortUrl || CHARACTERS[0];
}

/**
 * Decodes a short URL code back to its numeric ID
 * @param shortCode - The base62 encoded string
 * @returns The decoded numeric ID
 */
export function decodeShortUrl(shortCode: string): number {
  let id = 0;

  for (let i = 0; i < shortCode.length; i++) {
    const char = shortCode[i];
    const charIndex = CHARACTERS.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Invalid character in short URL: ${char}`);
    }
    id = id * BASE + charIndex;
  }
  return id;
}

/**
 * Configuration options for building a short URL
 */
export interface ShortUrlOptions {
  domain: string;
  includeRedirectPath?: boolean;
  redirectPathSegment?: string;
  includeProtocol?: boolean;
  protocol?: string;
  pathSeparator?: string;
}

/**
 * Default options for building a short URL
 */
export const DEFAULT_SHORT_URL_OPTIONS: ShortUrlOptions = {
  domain: "short.url",
  includeRedirectPath: true,
  redirectPathSegment: "r",
  includeProtocol: false,
  protocol: "https",
  pathSeparator: "/",
};

/**
 * In-memory storage for URL mappings
 * Maps numeric IDs to their original URLs
 */
export const urlStorage: Map<number, string> = new Map();

/**
 * Stores a URL mapping
 * @param id - The numeric ID
 * @param originalUrl - The original URL
 */
export function storeUrlMapping(id: number, originalUrl: string): void {
  urlStorage.set(id, originalUrl);
}

/**
 * Retrieves the original URL for a given ID
 * @param id - The numeric ID
 * @returns The original URL if found, undefined otherwise
 */
export function getOriginalUrl(id: number): string | undefined {
  return urlStorage.get(id);
}

/**
 * Builds a complete short URL with domain and customizable options
 * @param id - The numeric ID to encode
 * @param options - Configuration options for the short URL
 * @returns The complete short URL
 */
export function buildShortUrl(
  id: number,
  options?: string | ShortUrlOptions
): string {
  const opts: ShortUrlOptions =
    typeof options === "string"
      ? { ...DEFAULT_SHORT_URL_OPTIONS, domain: options }
      : { ...DEFAULT_SHORT_URL_OPTIONS, ...options };

  const shortCode = encodeId(id);

  let url = "";

  if (opts.includeProtocol && opts.protocol) {
    url += `${opts.protocol}://`;
  }

  url += opts.domain;

  if (opts.includeRedirectPath && opts.redirectPathSegment) {
    url += `${opts.pathSeparator}${opts.redirectPathSegment}`;
  }

  url += `${opts.pathSeparator}${shortCode}`;

  return url;
}
