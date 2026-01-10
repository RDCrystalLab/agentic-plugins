#!/bin/bash

# Setup Tailscale if TS_OAUTH_TOKEN is set
if [ -n "${TS_OAUTH_TOKEN}" ]; then
  echo "→ Setting up Tailscale with OAuth token..."
  
  # Get root directory name and hostname
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ROOT_DIR=$(basename "$(dirname "$SCRIPT_DIR")")
  MACHINE_HOSTNAME=$(hostname)
  TS_HOSTNAME="${ROOT_DIR}-${MACHINE_HOSTNAME}"
  
  echo "→ Using Tailscale hostname: ${TS_HOSTNAME}"
  sudo tailscale up --accept-routes --authkey="${TS_OAUTH_TOKEN}" --ssh --reset --hostname="${TS_HOSTNAME}"
  echo "→ Tailscale setup complete"
else
  echo "→ TS_OAUTH_TOKEN not set, skipping Tailscale setup"
fi
