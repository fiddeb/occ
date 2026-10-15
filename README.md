# OCC — OTLP Cardinality Checker

**The shape of your telemetry.**

OCC receives OpenTelemetry metrics, traces and logs and shows how they are
structured: which services produce them, which attributes they carry, and where
cardinality grows. Use it to investigate instrumentation before sending more
data to your observability backend.

[Website](https://fiddeb.github.io/occ/) ·
[Downloads & release notes](https://github.com/fiddeb/occ/releases) ·
[Report an issue](https://github.com/fiddeb/occ/issues)

![OCC dashboard with synthetic demo data](https://fiddeb.github.io/occ/assets/dashboard.jpg)

## What you can explore

- **Metrics:** names, types, units, attribute cardinality and estimated active
  series. The Metric Report highlights findings; a Prometheus classic what-if
  view shows conditional histogram series projections.
- **Traces:** span names, attributes and recurring span-name patterns.
- **Logs:** severity, attributes and recurring message templates.
- **Across signals:** a shared attribute catalog, service views and Noisy
  Neighbors to find large contributors to observed telemetry volume.
- **Deeper investigations:** opt into Deep Watch for selected attribute values,
  save and compare session snapshots, or export samples for separately installed
  OpenTelemetry Weaver live-check.

OCC runs as a single binary with an embedded web UI and REST API. Cardinality
figures are estimates; backend series projections depend on the selected model.

## Get started

Install with Homebrew on macOS or Linux:

```bash
brew install fiddeb/tap/occ
occ
```

Or download a binary from [Releases](https://github.com/fiddeb/occ/releases/latest).
Choose macOS (Apple Silicon or Intel), Linux (ARM64 or x86-64), or Windows
(x86-64). macOS ZIPs contain Developer ID signed and notarized binaries.
Releases include `SHA256SUMS` for download verification.

Open **http://localhost:8090**, then point your application's OTLP exporter at OCC:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
# Start your instrumented application in this shell.
```

You can also route telemetry through an OpenTelemetry Collector. The default
receivers are **4318** for OTLP HTTP and **4317** for OTLP gRPC.

OCC listens on all network interfaces by default. For local investigations,
start it bound to loopback (POSIX shells):

```bash
API_ADDR=127.0.0.1:8090 \
OTLP_HTTP_ADDR=127.0.0.1:4318 \
OTLP_GRPC_ADDR=127.0.0.1:4317 occ
```

## Data and sessions

Collected state lives in memory. Save a session snapshot to keep an investigation
across restarts. OCC retains bounded attribute samples and example log bodies;
Deep Watch retains values for selected keys. These can appear in the UI, API,
exports and saved sessions. Choose telemetry and storage locations accordingly.

OCC helps diagnose telemetry structure. Use your observability backend for
long-term telemetry storage, querying and alerting.

Versioned builds check GitHub for updates at startup; set `OCC_UPDATE_CHECK=false`
to disable checks. To update a Homebrew installation:

```bash
brew update
brew upgrade occ
```

## Releases and feedback

This repository hosts public downloads, release notes and the OCC website.
The application source is maintained separately.

Read [release notes](https://github.com/fiddeb/occ/releases) for changes, upgrade
instructions and known limitations. Please include your OCC version, platform
and steps to reproduce when [reporting an issue](https://github.com/fiddeb/occ/issues).
Use synthetic examples when sharing telemetry.
