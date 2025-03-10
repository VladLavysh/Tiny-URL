import {
  encodeId,
  decodeShortUrl,
  buildShortUrl,
  ShortUrlOptions,
  DEFAULT_SHORT_URL_OPTIONS,
  storeUrlMapping,
  getOriginalUrl,
} from "./utils";

/**
 * Options for creating a short URL
 */
export interface CreateShortUrlOptions extends ShortUrlOptions {
  hashAlgorithm?: "djb2" | "sdbm" | "custom";
  customHashFn?: (url: string) => number;
}

/**
 * Default options for creating a short URL
 */
const DEFAULT_CREATE_OPTIONS: CreateShortUrlOptions = {
  ...DEFAULT_SHORT_URL_OPTIONS,
  hashAlgorithm: "djb2",
};

/**
 * Creates a short URL from a long URL with customizable options
 * @param longUrl - The original long URL to shorten
 * @param domain - Domain name for the short URL
 * @param options - Optional configuration options
 * @returns The shortened URL
 */
export function createShortUrl(
  longUrl: string,
  domain: string,
  options?: Partial<Omit<CreateShortUrlOptions, "domain">>
): string {
  const opts: CreateShortUrlOptions = {
    ...DEFAULT_CREATE_OPTIONS,
    domain,
    ...options,
  };

  let hash: number;

  if (opts.hashAlgorithm === "custom" && opts.customHashFn) {
    hash = opts.customHashFn(longUrl);
  } else if (opts.hashAlgorithm === "sdbm") {
    hash = 0;
    for (let i = 0; i < longUrl.length; i++) {
      const char = longUrl.charCodeAt(i);
      hash = char + (hash << 6) + (hash << 16) - hash;
    }
  } else {
    hash = 5381;
    for (let i = 0; i < longUrl.length; i++) {
      const char = longUrl.charCodeAt(i);
      hash = (hash << 5) + hash + char;
    }
  }

  const positiveHash = Math.abs(hash);

  storeUrlMapping(positiveHash, longUrl);

  return buildShortUrl(positiveHash, opts);
}

/**
 * Extracts the short code from a short URL
 * @param shortUrl - The short URL
 * @returns The extracted short code
 */
function extractShortCode(shortUrl: string): string {
  const urlWithoutProtocol = shortUrl.replace(/^https?:\/\//, "");
  const parts = urlWithoutProtocol.split("/");

  return parts[parts.length - 1];
}

/**
 * Decodes a short URL back to its original URL
 * @param shortUrl - The shortened URL to decode
 * @returns The original URL if found, or undefined if not found
 */
export function decodeUrl(shortUrl: string): string | undefined {
  try {
    const shortCode = extractShortCode(shortUrl);
    const id = decodeShortUrl(shortCode);

    return getOriginalUrl(id);
  } catch (error) {
    return undefined;
  }
}
