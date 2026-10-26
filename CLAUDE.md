# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Waner Proofreader is an AI-powered web application designed to help non-native English speakers proofread text. Built with Next.js 15, TypeScript, and React 19, it provides a side-by-side editor with a diff viewer featuring accept/reject controls for reviewing AI-corrected text.

## Development Commands

```bash
# Install dependencies (using pnpm)
pnpm install

# Run development server with Turbopack on port 8080
pnpm run dev

# Build for production
pnpm run build

# Start production server on port 8080
pnpm run start

# Run linting
pnpm run lint
```

### Stopping the server on port 8080

Stop only the listener on this port, with a single `-i` spec:

```bash
lsof -tiTCP:8080 -sTCP:LISTEN | xargs kill
```

Never add a second `-i` (e.g. `lsof -ti:8080 -a -i@127.0.0.1`): lsof ORs multiple `-i` options even with `-a`, so that selects every process listening on `127.0.0.1`, which includes every running Claude Code session on this Mac. On 2026-10-26 that command killed all of them twice. Never `pkill`/`killall` by a broad name (`node`, `next`, `claude`) either.

## Architecture and Key Components

### Frontend Architecture
- **Main Page** (`src/app/page.tsx`): Responsive layout with mobile/desktop views
- **Text Editor** (`src/components/TextEditor.tsx`): Textarea-based editor with word/character count
- **Diff Viewer** (`src/components/DiffViewer.tsx`): Word-level diff visualization with accept/reject controls
- **Control Panel** (`src/components/ControlPanel.tsx`): Context, edit strength and math format controls
- **Custom Hooks**:
  - `useProofreader`: Manages proofreading state, streaming AI responses, and API calls
  - `useDiffChanges`: Computes word-level diffs, provides accept/reject change callbacks
- **Shared Utilities**:
  - `src/lib/diff-utils.ts`: Pure diff computation and change application functions
- **UI Framework**: HeroUI components with Tailwind CSS v4 for styling
- **State Management**: Local storage persistence via `use-local-storage-state`
- **Error Handling**: Error boundary component for graceful error recovery

### API Routes
- **`/api/completion`** (`src/app/api/completion/route.ts`): Handles AI text completion using Vercel AI SDK via any OpenAI-compatible endpoint

### Configuration System
- **Environment-based** (`src/lib/config.ts`): Reads TOML configuration from file path or base64-encoded string via `CONFIG` environment variable
- **Multi-user support**: Each user gets their own API key and endpoint configuration
- **Model**: Configured users all get one model, `DEFAULT_MODEL` in `src/lib/model.ts` (`~deepseek/deepseek-flash-latest`) unless the config sets `model`; only a visitor with their own API key may enter a model in Settings

### Prompt System
- **Prompts** (`src/lib/prompt.ts`): Two contexts (General, Academic) × three edit strengths (Proofread, Polish, Clarify), plus a shared editing contract and a readability paragraph based on arXiv:2610.29162. Switching context resets the edit strength to that context's `defaultInstruction` (General → Proofread, Academic → Polish)
- **Changing options**: Bump `OPTIONS_VERSION` in `prompt.ts` whenever contexts or instructions change; the saved selections are stored under `context-v<N>` / `instruction-v<N>`, so a bump resets every user's browser to the defaults. Unknown keys (e.g. a stale open tab posting an old key to the API) still fall back to General / Proofread via `resolve_context` / `resolve_instruction`

## Configuration

The app requires a TOML configuration file or base64-encoded config string:

```toml
model = "~deepseek/deepseek-flash-latest"  # optional

[[users]]
name = "username"
key = "password"
openai_base_url = "https://api.openai.com/v1"
openai_api_key = "sk-..."
```

Set via `CONFIG` environment variable as either:
- File path: `CONFIG=/path/to/config.toml`
- Base64 string: `CONFIG=<base64-encoded-toml>`

## Key Dependencies

- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript
- **Vercel AI SDK** for streaming AI responses
- **HeroUI** component library
- **Tailwind CSS v4** for styling

## Deployment

The app is configured for standalone deployment (`output: 'standalone'` in next.config.ts) and includes a Dockerfile for containerization. Default ports are 8080 for development/production.