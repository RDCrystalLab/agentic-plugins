#!/usr/bin/env -S uv run
"""Fork a new tmux window with a command and smart window title."""

import os
import shlex
import subprocess
import sys


def fork_tmux(command: str, title: str | None = None) -> str:
    """Open a new tmux window, set a smart title, and run the specified command.

    Args:
        command: The shell command to execute in the new window.
        title: Optional window title. If not provided, inferred from command.

    Returns:
        Status message with tmux window info.
    """
    cwd = os.getcwd()

    if title is None:
        title = _infer_title(command)

    # Find the target tmux session — always use tmux list-sessions
    # because $TMUX may not be set (e.g., uv run strips it, or Claude Code)
    target_session = _find_session()
    if target_session is None:
        return "Error: no tmux session found. Start tmux first."

    # Wrap command: use bash -c, keep shell open after command finishes
    wrapped = f"cd '{cwd}' && {command}; exec $SHELL"

    tmux_args = [
        "tmux", "new-window",
        "-t", target_session,
        "-n", title,
        "-c", cwd,
        "bash", "-c", wrapped,
    ]

    try:
        result = subprocess.run(tmux_args, capture_output=True, text=True)
        if result.returncode != 0:
            return f"Error: {result.stderr.strip()}"

        return f"Forked tmux window [{title}] in session [{target_session}]: {command}"
    except FileNotFoundError:
        return "Error: tmux not found. Install tmux first."
    except Exception as e:
        return f"Error: {e}"


def _find_session() -> str | None:
    """Find the best tmux session to target.

    Priority:
    1. The attached session (most likely the user's active session)
    2. The first available session
    """
    try:
        result = subprocess.run(
            ["tmux", "list-sessions", "-F", "#{session_name}:#{session_attached}"],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            return None

        sessions = result.stdout.strip().splitlines()
        if not sessions:
            return None

        # Prefer attached session
        for line in sessions:
            name, attached = line.rsplit(":", 1)
            if attached == "1":
                return name

        # Fallback: first session
        return sessions[0].rsplit(":", 1)[0]
    except FileNotFoundError:
        return None


def _infer_title(command: str) -> str:
    """Infer a short, descriptive window title from the command."""
    cmd_lower = command.lower()

    # Agentic coding tools
    if "claude" in cmd_lower:
        return "claude"
    if "codex" in cmd_lower:
        return "codex"
    if "gemini" in cmd_lower:
        return "gemini"

    # Common dev tools
    tool_map = {
        "npm run dev": "dev",
        "npm run build": "build",
        "npm test": "test",
        "yarn dev": "dev",
        "yarn build": "build",
        "pytest": "pytest",
        "cargo test": "cargo-test",
        "cargo run": "cargo-run",
        "docker": "docker",
        "kubectl": "kubectl",
        "make": "make",
        "go run": "go-run",
        "go test": "go-test",
        "python": "python",
        "node": "node",
        "bun": "bun",
        "deno": "deno",
    }
    for pattern, name in tool_map.items():
        if pattern in cmd_lower:
            return name

    # Fallback: first word of the command, truncated
    first_word = command.split()[0] if command.strip() else "fork"
    # Strip path prefix
    first_word = first_word.rsplit("/", 1)[-1]
    return first_word[:20]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: fork_tmux.py <command> [--title <title>]")
        sys.exit(1)

    args = sys.argv[1:]
    window_title = None

    if "--title" in args:
        idx = args.index("--title")
        if idx + 1 < len(args):
            window_title = args[idx + 1]
            args = args[:idx] + args[idx + 2:]

    cmd = " ".join(shlex.quote(a) for a in args)
    output = fork_tmux(cmd, window_title)
    print(output)
