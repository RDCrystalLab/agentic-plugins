# gh-tools

GitHub workflow commands for issues, PRs, and project management using the `gh` CLI.

## Prerequisites

- [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated

## Commands

| Command | Description |
|---------|-------------|
| `/gh-tools:gh-fix-issue <issue>` | Analyze and fix a GitHub issue end-to-end |
| `/gh-tools:gh-create-issue` | Create a new issue and add to GitHub Project |
| `/gh-tools:gh-augmented-issue <description>` | Investigate codebase and create a detailed issue |
| `/gh-tools:gh-list-top-issues <N>` | List top N priority issues from GitHub Project |
| `/gh-tools:gh-pr-review <PR>` | Review a Pull Request with checklist |
| `/gh-tools:gh-pr-followup <PR>` | Address PR review feedback and rework |

## Usage Examples

```
/gh-tools:gh-fix-issue 42
/gh-tools:gh-create-issue Add dark mode support. Labels: enhancement, priority-3
/gh-tools:gh-augmented-issue Refactor authentication module
/gh-tools:gh-list-top-issues 5
/gh-tools:gh-pr-review 15
/gh-tools:gh-pr-followup 15
```
