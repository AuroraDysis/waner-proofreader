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

## Architecture and Key Components

### Frontend Architecture
- **Main Page** (`src/app/page.tsx`): Responsive layout with mobile/desktop views
- **Text Editor** (`src/components/TextEditor.tsx`): Textarea-based editor with word/character count
- **Diff Viewer** (`src/components/DiffViewer.tsx`): Word-level diff visualization with accept/reject controls
- **Control Panel** (`src/components/ControlPanel.tsx`): Centralized controls for model selection and proofreading options
- **Custom Hooks**:
  - `useProofreader`: Manages proofreading state, streaming AI responses, and API calls
  - `useDiffChanges`: Computes word-level diffs, provides accept/reject change callbacks
  - `useModels`: Fetches available AI models
- **Shared Utilities**:
  - `src/lib/diff-utils.ts`: Pure diff computation and change application functions
- **UI Framework**: HeroUI components with Tailwind CSS v4 for styling
- **State Management**: Local storage persistence via `use-local-storage-state`
- **Error Handling**: Error boundary component for graceful error recovery

### API Routes
- **`/api/completion`** (`src/app/api/completion/route.ts`): Handles AI text completion using Vercel AI SDK, supports multiple AI providers
- **`/api/models`** (`src/app/api/models/route.ts`): Returns available AI models from configuration

### Configuration System
- **Environment-based** (`src/lib/config.ts`): Reads TOML configuration from file path or base64-encoded string via `CONFIG` environment variable
- **Multi-user support**: Each user gets their own API key and endpoint configuration
- **Model selection**: Supports multiple AI models (OpenAI, Google Gemini, Anthropic, etc.)

### Prompt System
- **Prompts** (`src/lib/prompt.ts`): Contains context-aware prompts for different writing scenarios (academic, business, casual)
- **Dynamic instructions**: Various proofreading styles (critical, concise, simple)

## Configuration

The app requires a TOML configuration file or base64-encoded config string:

```toml
models = ["openai/gpt-4o", "google/gemini-2.5-pro-preview-03-25", ...]

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