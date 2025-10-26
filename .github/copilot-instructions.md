# Hey API OpenAPI TypeScript Codegen

OpenAPI TypeScript is a CLI tool and library for generating TypeScript clients, SDKs, validators, and schemas from OpenAPI specifications. This is a monorepo built with pnpm workspaces, Turbo build orchestration, and TypeScript.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Setup

- Install Node.js (see `.nvmrc` for recommended version)
- Install pnpm globally: `npm install -g pnpm@10.15.1`
- Clone the repository and run setup commands

### Bootstrap, Build, and Test

```bash
# Install dependencies (takes ~1m 20s)
pnpm install

# Build packages only (NEVER CANCEL - takes ~2m 15s - set timeout to 180+ seconds)
pnpm build --filter="@hey-api/**"

# Build all including examples (NEVER CANCEL - takes ~5+ minutes - set timeout to 360+ seconds)
pnpm build

# Run tests (takes ~1m 5s - set timeout to 120+ seconds)
# NOTE: Some network-dependent tests may fail in sandboxed environments
pnpm test

# Run linting (takes ~35s)
pnpm lint

# Run type checking (NEVER CANCEL - takes ~1m 20s - set timeout to 120+ seconds)
pnpm typecheck

# Format code (takes ~35s)
pnpm format
```

### Development Workflow

```bash
# Start development mode for main package (watches for changes)
pnpm --filter @hey-api/openapi-ts dev

# Start development server for examples (e.g., fetch example)
pnpm --filter @example/openapi-ts-fetch dev
# Server starts on http://localhost:5173/

# Run CLI tool directly
node packages/openapi-ts/dist/run.js --help
# or after building
npx @hey-api/openapi-ts --help
```

## Build and Test Details

### **CRITICAL BUILD TIMING**

- **NEVER CANCEL BUILD COMMANDS** - They may take 2-5+ minutes
- `pnpm build --filter="@hey-api/**"`: ~2m 15s (packages only)
- `pnpm build`: ~5+ minutes (includes docs and examples)
- `pnpm install`: ~1m 20s
- `pnpm test`: ~1m 5s
- `pnpm typecheck`: ~1m 20s
- `pnpm lint`: ~35s
- `pnpm format`: ~35s

### Build Issues and Workarounds

- **Docs build may fail** due to pnpm version mismatch in VitePress - this is expected in some environments
- Use `pnpm build --filter="@hey-api/**"` to build packages without docs
- **Some tests may fail** in sandboxed environments due to network restrictions (OpenAPI spec downloads)
- **Generated test files** in `packages/openapi-ts-tests/` contain auto-generated snapshots that may have linting warnings - this is expected
- **Linting issues** in `.gen/snapshots/` directories are expected for generated code

## Validation

### Manual Testing Scenarios

After making changes, ALWAYS validate with these scenarios:

1. **CLI Functionality Test**:

   ```bash
   # Test CLI help
   node packages/openapi-ts/dist/run.js --help

   # Test CLI version
   node packages/openapi-ts/dist/run.js --version

   # Test basic code generation with a simple OpenAPI spec
   # Create a minimal test spec and generate client code
   node packages/openapi-ts/dist/run.js -i path/to/spec.json -o ./test-output --plugins "@hey-api/client-fetch" "@hey-api/typescript"
   ```

2. **Example Application Test**:

   ```bash
   # Start fetch example and verify it loads
   pnpm --filter @example/openapi-ts-fetch dev
   # Should start on http://localhost:5173/
   ```

3. **Development Mode Test**:
   ```bash
   # Start dev mode and make a small change to verify rebuilding
   pnpm --filter @hey-api/openapi-ts dev
   ```

### Pre-commit Validation

ALWAYS run these commands before committing or the CI will fail:

```bash
# Use lint:fix to auto-fix issues (some warnings in generated test files are expected)
pnpm lint:fix

# Run typecheck (can target specific packages with --filter)
pnpm typecheck

# Run tests (some network tests may fail in sandboxed environments)
pnpm test
```

**NOTE**: Some linting warnings in generated test snapshot files (`.gen/snapshots/`) are expected and should be ignored. The `lint:fix` command will resolve actual source code issues.

## Repository Structure

### Key Packages

- `packages/openapi-ts/` - Main CLI tool and library
- `packages/codegen-core/` - Core code generation utilities
- `packages/custom-client/` - Custom HTTP client implementations
- `packages/nuxt/` - Nuxt.js integration
- `packages/vite-plugin/` - Vite plugin

### Examples

- `examples/openapi-ts-fetch/` - Fetch client example (React + Vite)
- `examples/openapi-ts-angular/` - Angular client example
- `examples/openapi-ts-tanstack-react-query/` - TanStack React Query integration
- `examples/openapi-ts-vue/` - Vue.js integration
- Plus many more framework-specific examples

### Configuration Files

- `pnpm-workspace.yaml` - Workspace configuration
- `turbo.json` - Turbo build configuration
- `package.json` - Root package with workspace scripts
- `.nvmrc` - Node.js version specification

## Common Tasks

### Working with the Main Package

```bash
# Install deps for main package
pnpm --filter @hey-api/openapi-ts install

# Build main package only
pnpm --filter @hey-api/openapi-ts build

# Test main package only
pnpm --filter @hey-api/openapi-ts test

# Start dev mode for main package
pnpm --filter @hey-api/openapi-ts dev
```

### Working with Examples

```bash
# List all example packages
ls examples/

# Run specific example
pnpm --filter @example/openapi-ts-fetch dev

# Build all examples
pnpm build --filter="@example/**"
```

### Debugging and Troubleshooting

- Check `turbo.json` for task dependencies and configuration
- Use `pnpm list` to see installed packages
- Use `pnpm why <package>` to understand dependency chains
- Check individual package `package.json` files for available scripts

## CI/CD Pipeline

The repository uses GitHub Actions (`.github/workflows/ci.yml`):

- Tests on multiple Node.js versions
- Tests on multiple OS (macOS, Ubuntu, Windows)
- Runs build, lint, typecheck, and test commands
- Publishes preview packages on PRs

## Performance Expectations

- **Cold install**: ~1m 20s
- **Cold build**: ~2-5m depending on scope
- **Incremental builds**: ~30s in dev mode
- **Test suite**: ~1m 5s
- **Linting**: ~35s
- **Type checking**: ~1m 20s

Remember: This is a complex monorepo with many dependencies. Be patient with build times and always use appropriate timeouts for long-running commands.
