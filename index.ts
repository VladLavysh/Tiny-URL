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
 * @param domainOrOptions - Domain name (required) or configuration options object
 * @returns The shortened URL
 */
export function createShortUrl(
  longUrl: string,
  domainOrOptions: string | Partial<CreateShortUrlOptions>
): string {
  const opts: CreateShortUrlOptions =
    typeof domainOrOptions === "string"
      ? { ...DEFAULT_CREATE_OPTIONS, domain: domainOrOptions }
      : {
          ...DEFAULT_CREATE_OPTIONS,
          ...domainOrOptions,
          domain: domainOrOptions.domain || DEFAULT_CREATE_OPTIONS.domain,
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

  // Store the mapping between the hash and the original URL
  storeUrlMapping(positiveHash, longUrl);

  return buildShortUrl(positiveHash, opts);
}

/**
 * Extracts the short code from a short URL
 * @param shortUrl - The short URL
 * @returns The extracted short code
 */
function extractShortCode(shortUrl: string): string {
  // Handle URLs with or without protocol
  const urlWithoutProtocol = shortUrl.replace(/^https?:\/\//, "");

  // Split by path separator (default is '/')
  const parts = urlWithoutProtocol.split("/");

  // The short code is the last part of the URL
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

    // Retrieve the original URL from storage
    return getOriginalUrl(id);
  } catch (error) {
    // Return undefined if there's an error during decoding
    return undefined;
  }
}
