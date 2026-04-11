---
name: cli-creator
description: >
  Build a composable CLI from API docs, an OpenAPI spec, existing curl examples, an SDK, a web app,
  an admin tool, or a local script. Use when the user wants to create a command-line tool that can
  run from any repo, expose composable read/write commands, return stable JSON, manage auth, and
  pair with a companion skill.
---

# CLI Creator

Create a real CLI that future agent threads can run by command name from any working directory.

This skill is for durable tools, not one-off scripts. If a short script in the current repo solves the task, write the script there instead.

## Start

Name the target tool, its source, and the first real jobs it should do:

- Source: API docs, OpenAPI JSON, SDK docs, curl examples, browser app, existing internal script, article, or working shell history.
- Jobs: literal reads/writes such as `list drafts`, `download failed job logs`, `search messages`, `upload media`, `read queue schedule`.
- Install name: a short binary name such as `ci-logs`, `slack-cli`, `sentry-cli`, or `buildkite-logs`.

Prefer a new folder under `~/code/clis/<tool-name>` when the user wants a personal tool and has not named a repo.

Before scaffolding, check whether the proposed command already exists:

```bash
command -v <tool-name> || true
```

If it exists, choose a clearer install name or ask the user.

## Choose the Runtime

Before choosing, inspect the user's machine and source material:

```bash
command -v cargo rustc node pnpm npm python3 uv || true
```

Then choose the least surprising toolchain:

- Default to **Python (uv single-file)** for most CLIs: zero-setup, inline dependency declaration, one file that runs anywhere `uv` is installed. See the Python Defaults section below.
- Use **Rust** when performance matters (large data, many concurrent requests), the CLI will be distributed as a binary, or the user explicitly prefers it.
- Use **TypeScript/Node** when the official SDK, auth helper, browser automation library, or existing repo tooling is the reason the CLI can be better.

Do not pick a language that adds setup friction unless it materially improves the CLI. If the best language is not installed, either install the missing toolchain with the user's approval or choose the next-best installed option.

State the choice in one sentence before scaffolding, including the reason and the installed toolchain you found.

## Command Contract

Sketch the command surface in chat before coding. Include the binary name, discovery commands, resolve or ID-lookup commands, read commands, write commands, raw escape hatch, auth/config choice, and PATH/install command.

When designing the command surface, read [references/agent-cli-patterns.md](references/agent-cli-patterns.md) for the expected composable CLI shape.

Build toward this surface:

- `tool-name --help` shows every major capability.
- `tool-name --json doctor` verifies config, auth, version, endpoint reachability, and missing setup.
- `tool-name init ...` stores local config when env-only auth is painful.
- Discovery commands find accounts, projects, workspaces, teams, queues, channels, repos, dashboards, or other top-level containers.
- Resolve commands turn names, URLs, slugs, permalinks, customer input, or build links into stable IDs so future commands do not repeat broad searches.
- Read commands fetch exact objects and list/search collections. Paginated lists support a bounded `--limit`, cursor, offset, or clearly documented default.
- Write commands do one named action each: create, update, delete, upload, schedule, retry, comment, draft. They accept the narrowest stable resource ID, support `--dry-run`, `draft`, or `preview` first when the service allows it, and do not hide writes inside broad commands such as `fix`, `debug`, or `auto`.
- `--json` returns stable machine-readable output.
- A raw escape hatch exists: `request`, `tool-call`, `api`, or the nearest honest name.

Do not expose only a generic `request` command. Give the agent high-level verbs for the repeated jobs.

Document the JSON policy in the CLI README or equivalent: API pass-through versus CLI envelope, success shape, error shape, and one example for each command family. Under `--json`, errors must be machine-readable and must not contain credentials.

## Auth and Config

Support the boring paths first, in this precedence order:

1. Environment variable using the service's standard name, such as `GITHUB_TOKEN`.
2. User config under `~/.<tool-name>/config.toml` or another simple documented path.
3. `--api-key` or a tool-specific token flag only for explicit one-off tests. Prefer env/config for normal use because flags can leak into shell history or process listings.

Never print full tokens. `doctor --json` should say whether a token is available, the auth source category (`flag`, `env`, `config`, provider default, or missing), and what setup step is missing.

If the CLI can run without network or auth, make that explicit in `doctor --json`: report fixture/offline mode, whether fixture data was found, and whether auth is not required for that mode.

For internal web apps sourced from DevTools curls, create sanitized endpoint notes before implementing: resource name, method/path, required headers, auth mechanism, CSRF behavior, request body, response ID fields, pagination, errors, and one redacted sample response. Never commit copied cookies, bearer tokens, customer secrets, or full production payloads.

Use screenshots to infer workflow, UI vocabulary, fields, and confirmation points. Do not treat screenshots as API evidence unless they are paired with a network request, export, docs page, or fixture.

## Build Workflow

1. Read the source just enough to inventory resources, auth, pagination, IDs, media/file flows, rate limits, and dangerous write actions. If the docs expose OpenAPI, download or inspect it before naming commands.
2. Sketch the command list in chat. Keep names short and shell-friendly.
3. Scaffold the CLI with a README or equivalent repo-facing instructions.
4. Implement `doctor`, discovery, resolve, read commands, one narrow draft or dry-run write path if requested, and the raw escape hatch.
5. Install the CLI on PATH so `tool-name ...` works outside the source folder.
6. Smoke test from another repo or `/tmp`, not only with package-manager wrappers. Run `command -v <tool-name>`, `<tool-name> --help`, and `<tool-name> --json doctor`.
7. Run format, typecheck/build, unit tests for request builders, pagination/request-body builders, no-auth `doctor`, help output, and at least one fixture, dry-run, or live read-only API call.

If a live write is needed for confidence, ask first and make it reversible or draft-only.

When the source is an existing script or shell history, split the working invocation into real phases: setup, discovery, download/export, transform/index, draft, upload, poll, live write. Preserve the flags, paths, and environment variables the user already relies on, then wrap the repeatable phases with stable IDs, bounded JSON, and file outputs.

For raw escape hatches, support read-only calls first. Do not run raw non-GET/HEAD requests against a live service unless the user asked for that specific write.

For media, artifact, or presigned upload flows, test each phase separately: create upload, transfer bytes, poll/read processing status, then attach or reference the resulting ID.

For fixture-backed prototypes, keep fixtures in a predictable project path and make the CLI locate them after installation. Smoke-test from `/tmp` to catch binaries that only work inside the source folder.

For log-oriented CLIs, keep deterministic snippet extraction separate from model interpretation. Prefer a command that emits filenames, line numbers or byte ranges, matched rules, and short excerpts.

## Python Defaults (uv single-file)

**Preferred approach**: a single `.py` file with [PEP 723 inline script metadata](https://packaging.python.org/en/latest/specifications/inline-script-metadata/) that `uv run` executes directly — zero virtualenv, zero `pyproject.toml`, zero setup step.

### Skeleton

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "httpx",
# ]
# ///
"""
<tool-name> — one-line description.

Usage:
    <tool-name> [--json] <command> [options]
"""

import argparse
import json
import os
import sys
from pathlib import Path

def cmd_doctor(args):
    """Verify config, auth, endpoint reachability."""
    result = {"ok": True, "auth": {}, "version": "0.1.0"}
    token = os.environ.get("<SERVICE>_TOKEN") or _read_config_token()
    result["auth"] = {
        "source": "env" if os.environ.get("<SERVICE>_TOKEN") else "config" if token else "missing",
        "available": bool(token),
    }
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Auth: {'✓' if token else '✗ (set <SERVICE>_TOKEN)'}")

def main():
    parser = argparse.ArgumentParser(prog="<tool-name>", description="...")
    parser.add_argument("--json", action="store_true", help="Machine-readable JSON output")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("doctor", help="Check config and auth")
    # add more subcommands here

    args = parser.parse_args()
    if args.command == "doctor":
        cmd_doctor(args)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
```

### Install on PATH

```bash
# Copy the single file and make it executable
cp <tool-name>.py ~/.local/bin/<tool-name>
chmod +x ~/.local/bin/<tool-name>
```

The shebang `#!/usr/bin/env -S uv run --script` makes `uv` resolve inline dependencies on first run and cache them automatically. No virtualenv management needed.

### Key rules

- **One file** — the entire CLI lives in a single `.py` file. No `__init__.py`, no package structure.
- **Inline dependencies** — declare in the `# /// script` block. Common choices: `httpx` for HTTP, `rich` for pretty output, `click` or `typer` only when `argparse` subcommands get genuinely messy.
- **Standard library first** — `argparse`, `json`, `pathlib`, `os`, `sys`, `urllib.request` are free. Only add dependencies when they earn their weight.
- **`uv run` everywhere** — the file runs via `uv run <tool-name>.py` or directly via shebang. Never require `pip install` or virtualenv activation.
- **No `pyproject.toml`** — unless the CLI genuinely grows beyond one file (rare). If it does, switch to `uv init` + `uv run` with a proper project.

### When to graduate from single-file

Switch to a full `pyproject.toml` project only when:
- The CLI exceeds ~500 lines and needs internal modules
- It requires compiled extensions or complex build steps
- The user wants to publish to PyPI

In that case, use `uv init`, keep `uv run` as the entry point, and add a `Makefile` target for `make install-local`.

## Rust Defaults

When building in Rust, use established crates instead of custom parsers:

- `clap` for commands and help
- `reqwest` for HTTP
- `serde` / `serde_json` for payloads
- `toml` for small config files
- `anyhow` for CLI-shaped error context

Add a `Makefile` target such as `make install-local` that builds release and installs the binary into `~/.local/bin`.

## TypeScript/Node Defaults

When building in TypeScript/Node, keep the CLI installable as a normal command:

- `commander` or `cac` for commands and help
- native `fetch`, the official SDK, or the user's existing HTTP helper for API calls
- `zod` only where external payload validation prevents real breakage
- `package.json` `bin` entry for the installed command
- `tsup`, `tsx`, or `tsc` using the repo's existing convention

Add an install path such as `pnpm install`, `pnpm build`, and `pnpm link --global`, or a `Makefile` target that installs a small wrapper into `~/.local/bin`.

## Companion Skill

After the CLI works, create or update a small skill for it. Place it in the project's `skills/<tool-name>/SKILL.md`.

Write the companion skill in the order a future agent thread should use the CLI, not as a tour of every feature. Explain:

- How to verify the installed command exists.
- Which command to run first.
- How auth is configured.
- Which discovery command finds the common ID.
- The safe read path.
- The intended draft/write path.
- The raw escape hatch.
- What not to do without explicit user approval.
- Three copy-pasteable command examples.

Keep API reference details in the CLI docs or a skill reference file. Keep the skill focused on ordering, safety, and examples future agent threads should actually run.
