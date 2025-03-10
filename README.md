# URL Shortener

A simple and lightweight URL shortening library for Node.js. This package provides functionality to create short URLs from long ones and decode them back.

## Installation

```bash
npm install @vladislav/tiny-url-shortener
```

## Usage

### Creating a Short URL

```typescript
import { createShortUrl } from "@vladislav/tiny-url-shortener";

// 1. Create a short URL with required domain parameter
const shortUrl = createShortUrl(
  "https://example.com/very/long/path/with/many/parameters?param1=value1&param2=value2",
  "short.url"
);
console.log(shortUrl); // Output: short.url/r/Ab3x7Z (example)

// 2. Create a short URL with custom domain
const customShortUrl = createShortUrl(
  "https://example.com/very/long/path",
  "myshort.link"
);
console.log(customShortUrl); // Output: myshort.link/r/Xy4p9Q (example)

// 3. Create a short URL with customized options
const customizedUrl = createShortUrl(
  "https://example.com/very/long/path",
  "myshort.link",
  {
    includeProtocol: true,
    protocol: "https",
    includeRedirectPath: false,
  }
);
console.log(customizedUrl); // Output: https://myshort.link/Xy4p9Q (example)
```

### Customization Options

The `createShortUrl` function accepts a wide range of options for customization:

```typescript
interface CreateShortUrlOptions {
  // Domain options
  includeProtocol?: boolean; // Whether to include protocol (default: false)
  protocol?: string; // Protocol to use (default: 'https')

  // Path options
  includeRedirectPath?: boolean; // Whether to include the redirect path segment (default: true)
  redirectPathSegment?: string; // Custom path segment (default: 'r')
  pathSeparator?: string; // Custom separator between path segments (default: '/')

  // Hash algorithm options
  hashAlgorithm?: "djb2" | "sdbm" | "custom"; // Hash algorithm to use (default: 'djb2')
  customHashFn?: (url: string) => number; // Custom hash function
}
```

### Using Different Hash Algorithms

```typescript
// Using the SDBM hash algorithm
const sdbmUrl = createShortUrl("https://example.com/path", "short.url", {
  hashAlgorithm: "sdbm",
});

// Using a custom hash function
const customHashUrl = createShortUrl("https://example.com/path", "short.url", {
  hashAlgorithm: "custom",
  customHashFn: (url) => {
    // Simple custom hash function
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash * 31 + url.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
  },
});
```

### Decoding a Short URL

```typescript
import { decodeUrl } from "@vladislav/tiny-url-shortener";

// Decode a short URL to get the original URL
const originalUrl = decodeUrl("short.url/r/Ab3x7Z");
console.log(originalUrl); // Output: https://example.com/very/long/path (original URL)

// If the short URL is not found in storage
const unknownUrl = decodeUrl("short.url/r/Unknown");
if (unknownUrl === undefined) {
  console.log("URL not found in storage");
}
```

## Advanced Usage

### Customizing URL Structure

```typescript
// Without redirect path segment
const noRedirectPath = createShortUrl("https://example.com/path", "short.url", {
  includeRedirectPath: false,
});
console.log(noRedirectPath); // Output: short.url/Ab3x7Z

// With custom redirect path segment
const customPath = createShortUrl("https://example.com/path", "short.url", {
  redirectPathSegment: "goto",
});
console.log(customPath); // Output: short.url/goto/Ab3x7Z

// With custom path separator
const customSeparator = createShortUrl(
  "https://example.com/path",
  "short.url",
  { pathSeparator: "-" }
);
console.log(customSeparator); // Output: short.url-r-Ab3x7Z

// With protocol included
const withProtocol = createShortUrl("https://example.com/path", "short.url", {
  includeProtocol: true,
});
console.log(withProtocol); // Output: https://short.url/r/Ab3x7Z
```

## How It Works

1. The library generates a hash from the input URL using one of the available hash algorithms (DJB2, SDBM, or a custom function).
2. The hash is converted to a positive number to ensure compatibility.
3. The numeric ID is encoded using base62 encoding (A-Z, a-z, 0-9) to create a short code.
4. The short code is combined with the domain and path options to create the final short URL.

## API Reference

### `createShortUrl(longUrl: string, domain: string, options?: Partial<CreateShortUrlOptions>): string`

Creates a short URL from a long URL with customizable options.

- `longUrl`: The original URL to shorten
- `domain`: Domain name for the short URL
- `options`: Optional configuration options

### `decodeUrl(shortUrl: string): string | undefined`

Decodes a short URL back to its original URL.

- `shortUrl`: The short URL to decode
- Returns: The original URL if found in storage, or undefined if not found

### `encodeId(id: number): string`

Encodes a numeric ID to a base62 string.

- `id`: The numeric ID to encode

### `decodeShortUrl(shortCode: string): number`

Decodes a base62 encoded short code back to its numeric ID.

- `shortCode`: The base62 encoded string

### `buildShortUrl(id: number, options: ShortUrlOptions): string`

Builds a complete short URL from a numeric ID and options.

- `id`: The numeric ID to encode
- `options`: Configuration options for the short URL (domain is required)

## License

MIT
