# playwright-cli Plugin

Browser automation plugin for Claude Code using `playwright-cli`.

## Features

- Navigate websites and interact with web pages
- Fill forms and submit data
- Take screenshots and generate PDFs
- Multi-tab browser session management
- Network request mocking
- Cookie, localStorage, and sessionStorage management
- Tracing and video recording for debugging
- Test generation from browser interactions

## Prerequisites

- `playwright-cli` must be installed globally or available via `npx`

## Usage

This plugin adds the `playwright-cli` skill, which is triggered when the user needs to:

- Navigate websites or interact with web pages
- Fill forms or extract data from web pages
- Take screenshots or generate PDFs
- Test web applications
- Debug web page behavior

### Quick Example

```bash
playwright-cli open https://example.com
playwright-cli snapshot
playwright-cli click e3
playwright-cli screenshot --filename=result.png
playwright-cli close
```

## Skill Reference

See [SKILL.md](skills/playwright-cli/SKILL.md) for the full command reference and usage examples.
