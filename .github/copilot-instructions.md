## 🚨 CRITICAL: MUST READ BEFORE ANY TASK

**IMPORTANT**: The following sections define mandatory prerequisites for specific types of work. Failure to read these files once per session will result in incorrect implementations. This is NOT optional.

### Convex Backend Work

**Files**: `convex/**`
**MANDATORY**: Read `.cursor/rules/convex.mdc` FIRST

## Project Overview

- Project Status: @.claude/docs/project-status.md
- App Design: @.claude/docs/app-design-document.md
- Tech Stack: @.claude/docs/tech-stack.md
- Project Structure: @.claude/docs/project-structure.md

## Rules

- @.cursor/rules/convex.mdc@ - Convex backend development

- @.cursor/rules/react.mdc - React patterns
- @.cursor/rules/nextjs.mdc - Next.js patterns
- @.cursor/rules/global-css.mdc - CSS configuration
- @.cursor/rules/tailwind-v4.mdc - Tailwind v4 features
- @.cursor/rules/convex-client.mdc - Convex client utilities
- @.cursor/rules/modal-system.mdc - Modal implementation
- @.cursor/rules/toast.mdc - Notification patterns
- @.cursor/rules/jotai-x.mdc - State management patterns

## Development

### Commands

DO NOT run `bun dev`, or `bun build` or `bun start` unless asked.

- `bun typecheck` - Run TypeScript type checking (must pass without errors) on each task end. Do not run this unless you can't see it in Background Bash Shells.
- `bun lint:fix` - Run ESLint and fix linting errors on precommit (not on each task end)
- **NEVER make git commits unless explicitly asked by the user.**

### Agents

Specialized sub-agents are automatically picked by Claude. Each operates with its own context window and focused expertise.

**@ References Rule**: When using sub-agents with @ references in the prompt, the sub-agent MUST use the Read tool to read ALL @ referenced files before starting any task. Sub-agents cannot automatically access @ referenced content like the main context can.
