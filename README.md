# URL Shortener

A simple and lightweight URL shortening library for Node.js. This package provides functionality to create short URLs from long ones and decode them back.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Creating a Short URL](#creating-a-short-url)
  - [Customization Options](#customization-options)
  - [Using Different Hash Algorithms](#using-different-hash-algorithms)
  - [Decoding a Short URL](#decoding-a-short-url)
- [Advanced Usage](#advanced-usage)
  - [Customizing URL Structure](#customizing-url-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [License](#license)

## Installation

```bash
npm install @unitio-code/url-shortener
```

## Usage

### Creating a Short URL

#### 1. Create a short URL with required domain parameter

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

const shortUrl = createShortUrl(
  "https://example.com/very/long/path/with/many/parameters?param1=value1&param2=value2",
  "short.url"
);
console.log(shortUrl); // Output: short.url/r/Ab3x7Z (example)
```

#### 2. Create a short URL with custom domain

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

const customShortUrl = createShortUrl(
  "https://example.com/very/long/path",
  "myshort.link"
);
console.log(customShortUrl); // Output: myshort.link/r/Xy4p9Q (example)
```

#### 3. Create a short URL with customized options

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

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

#### Using the SDBM hash algorithm

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

const sdbmUrl = createShortUrl("https://example.com/path", "short.url", {
  hashAlgorithm: "sdbm",
});
console.log(sdbmUrl); // Output: short.url/r/Kp7q2R (example)
```

#### Using a custom hash function

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

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
console.log(customHashUrl); // Output: short.url/r/Mn5t8V (example)
```

### Decoding a Short URL

#### Basic decoding example

```typescript
import { decodeUrl } from "@unitio-code/url-shortener";

// Decode a short URL to get the original URL
const originalUrl = decodeUrl("short.url/r/Ab3x7Z");
console.log(originalUrl); // Output: https://example.com/very/long/path (original URL)
```

#### Handling non-existent URLs

```typescript
import { decodeUrl } from "@unitio-code/url-shortener";

// If the short URL is not found in storage
const unknownUrl = decodeUrl("short.url/r/Unknown");
if (unknownUrl === undefined) {
  console.log("URL not found in storage");
}
```

## Advanced Usage

### Customizing URL Structure

#### Without redirect path segment

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

const noRedirectPath = createShortUrl("https://example.com/path", "short.url", {
  includeRedirectPath: false,
});
console.log(noRedirectPath); // Output: short.url/Ab3x7Z
```

#### With custom redirect path segment

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

const customPath = createShortUrl("https://example.com/path", "short.url", {
  redirectPathSegment: "goto",
});
console.log(customPath); // Output: short.url/goto/Ab3x7Z
```

#### With custom path separator

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

const customSeparator = createShortUrl(
  "https://example.com/path",
  "short.url",
  { pathSeparator: "-" }
);
console.log(customSeparator); // Output: short.url-r-Ab3x7Z
```

#### With protocol included

```typescript
import { createShortUrl } from "@unitio-code/url-shortener";

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
- Returns: A base62 encoded string

### `decodeShortUrl(shortCode: string): number`

Decodes a base62 encoded short code back to its numeric ID.

- `shortCode`: The base62 encoded string
- Returns: The numeric ID

### `buildShortUrl(id: number, options: ShortUrlOptions): string`

Builds a complete short URL from a numeric ID and options.

- `id`: The numeric ID to encode
- `options`: Configuration options for the short URL (domain is required)
- Returns: The complete short URL string

## License

MIT
