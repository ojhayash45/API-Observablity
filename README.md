# API-Tracing

**An API observability dashboard for HTTP request testing, response analysis, network performance monitoring, and distributed tracing.**

API-Tracing is a developer-focused tool for sending HTTP requests, inspecting API responses, analyzing request timing, and visualizing available tracing metadata through a clean, responsive interface.

## Features

### HTTP Request Management
- Support for `GET`, `POST`, `PUT`, and `DELETE` methods.
- Custom request headers.
- Request body editor for supported HTTP methods.
- API response inspection with status codes and response headers.
- Error handling for invalid URLs, network failures, timeouts, proxy failures, and unsupported protocols.

### Response Analysis
- Pretty-printed JSON response viewer.
- Raw response inspection.
- Response header visualization.
- HTTP status and status text.
- Request duration and performance metrics.

### Network Performance Monitoring
Analyze available request timing metrics, including:

- DNS lookup
- TCP connection
- TLS handshake
- Time to First Byte (TTFB)
- Response download
- Total request duration

Detailed timing metrics depend on browser capabilities and the timing data available from the underlying implementation.

### Distributed Tracing
- W3C Trace Context support through the `traceparent` header.
- Trace ID and Span ID generation and visualization.
- Response tracing header detection.
- `Server-Timing` header parsing for supported timing spans.
- Detection of returned `traceparent` and `traceresponse` headers.
- Clear indication when server-side tracing metadata is unavailable.

### Developer Experience
- Clean, professional observability interface.
- Light and dark themes.
- Responsive layout.
- Same-origin development proxy for API requests.
- Built-in demo endpoints for local testing.
- Automated testing with Vitest.
- Code quality checks with ESLint.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Data Management | TanStack React Query |
| UI Components | Radix UI |
| Icons | Lucide React |
| Testing | Vitest |
| Code Quality | ESLint |

## Prerequisites

Ensure the following tools are installed:

- Node.js 18 or newer
- npm 9 or newer
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/API-Tracing.git
cd API-Tracing
```

Replace `YOUR_USERNAME` with your GitHub username and update the repository URL if your repository has a different name.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal. The application is configured to use port `8080`.

If the port is occupied, Vite may select another available port depending on its configuration.

## Usage

1. Launch API-Tracing in your browser.
2. Enter the target API URL.
3. Select the HTTP method.
4. Configure request headers as needed.
5. Add a request body where applicable.
6. Click **Send** to execute the request.
7. Inspect the response status, headers, and body.
8. Review network timing metrics and available tracing metadata.

### Example API Request

Use the following public endpoint to test a basic `GET` request:

```text
https://jsonplaceholder.typicode.com/users/1
```

### Example JSON Request Body

```json
{
  "name": "My Collection",
  "description": "Testing APIs"
}
```

## Development Proxy

API-Tracing uses a Vite development proxy to forward browser requests to external API endpoints and reduce common CORS-related limitations.

The frontend sends requests through:

```text
/api/proxy
```

The development proxy is designed to handle:

- Forwarding HTTP and HTTPS requests.
- Following redirects.
- Returning upstream status codes and response bodies.
- Forwarding supported response headers, including tracing metadata.
- Removing unsafe hop-by-hop headers.
- Adding a default `Accept` header.
- Adding an `API-Tracing` user agent.
- Enforcing a 30-second request timeout.
- Reporting network, upstream, and timeout errors.

The Vite development proxy is not a production backend. Deploying the application requires a secured server-side proxy, serverless function, or edge function for equivalent functionality.

## Distributed Tracing

API-Tracing generates a W3C Trace Context header for outgoing requests:

```http
traceparent: 00-{trace-id}-{span-id}-01
```

The header contains a trace identifier, a span identifier, and trace flags. Compatible instrumented services can use this context to correlate requests across distributed systems.

### Supported Tracing Metadata

```http
traceparent
traceresponse
server-timing
```

Example `Server-Timing` header:

```http
Server-Timing: database;dur=42, upstream;dur=85
```

When supported timing metadata is returned, API-Tracing parses the available entries and displays them as timing spans.

### Tracing Limitations

API-Tracing cannot automatically discover internal database queries, authentication services, or downstream service calls from an ordinary HTTP response.

Detailed server-side spans require the target service to expose suitable tracing metadata or use compatible instrumentation, such as OpenTelemetry.

When server-side spans are unavailable, the dashboard can still display client-observed request duration and indicate that server tracing data is unavailable.

## Built-in Demo API

API-Tracing includes development-only demo routes for testing collection and log operations.

### Create a Collection

```http
POST /api/collections
Content-Type: application/json
```

Request body:

```json
{
  "name": "My Collection",
  "description": "Testing APIs"
}
```

### Retrieve Collections

```http
GET /api/collections
```

### Retrieve Logs

```http
GET /api/logs
```

These endpoints are intended for local development and demonstrations. Their data is stored in memory and is cleared when the development server restarts.

The examples above use the demo API route paths. The actual port and proxy configuration depend on the project's Vite setup.

## Project Structure

```text
API-Tracing/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── HeadersEditor.tsx
│   │   ├── NetworkMetrics.tsx
│   │   ├── RequestPanel.tsx
│   │   ├── ResponseViewer.tsx
│   │   ├── TimelineBar.tsx
│   │   └── TracingPanel.tsx
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── test/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run build:dev` | Build using development configuration |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Execute the test suite |
| `npm run test:watch` | Run tests in watch mode |

These commands depend on the scripts configured in `package.json`.

## Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the generated build locally:

```bash
npm run preview
```

The development proxy does not automatically become available in production. Configure a dedicated backend or serverless endpoint before deploying features that rely on `/api/proxy`.

## Security Considerations

API-Tracing is designed primarily for development and API testing.

Before exposing the application publicly, implement appropriate safeguards:

- Authenticate users and enforce authorization.
- Restrict outbound requests to approved target hosts.
- Implement Server-Side Request Forgery (SSRF) protection.
- Block loopback, private, link-local, and other prohibited IP ranges.
- Revalidate resolved IP addresses and redirects to prevent bypasses.
- Validate and restrict request headers.
- Enforce request body and response size limits.
- Apply rate limiting and request timeouts.
- Keep API credentials and secrets on the server.
- Avoid logging or displaying sensitive credentials.
- Use secure credential storage and appropriate access controls.

Never expose an unrestricted server-side proxy to untrusted users. An unsecured proxy can be abused to access internal services or sensitive infrastructure.

## Troubleshooting

### Application Does Not Start

Install the project dependencies and restart the development server:

```bash
npm install
npm run dev
```

### API Request Fails

Verify that:

- The target URL uses `http://` or `https://`.
- The target API is reachable.
- Required authentication headers are present.
- The request body contains valid JSON when required.
- The development server and proxy are running.
- The upstream API has not rejected the request or exceeded the timeout.

### Network Timing Metrics Are Missing

Some network timing phases may be unavailable because of browser restrictions, implementation limitations, or missing timing data. Only report phases that can be measured reliably.

### Server-Side Tracing Is Unavailable

The target API may not return `traceparent`, `traceresponse`, or `Server-Timing` metadata. Client-observed request duration can still be displayed when available.

## Testing

Run the test suite:

```bash
npm run test
```

Run tests continuously during development:

```bash
npm run test:watch
```

Check code quality with ESLint:

```bash
npm run lint
```

## Future Enhancements

Potential future improvements include:

- OpenTelemetry integration for richer distributed traces.
- Request history and saved collections.
- Exportable request and response data.
- Advanced latency comparisons and visualizations.
- Environment-based configuration and secure credential management.
- Production-ready backend proxy and access controls.

## License

No license has been specified yet. Add a `LICENSE` file before distributing the project under an open-source license.

## Author

Deepshikha Singh
Pallavi Singh
Yash Vardhan Ojha


---

**API-Tracing — Inspect requests. Measure performance. Understand traces.**
