#!/bin/bash

echo "→ Bootstrap steps start here:\n------------------"

sudo apt update
sudo apt install -y \
  file \
  iputils-ping \
  stow \
  supervisor \
  espeak \
  byacc \
  bison \
  libncurses-dev \
  libpam0g-dev

packages=(
  bun@1
  eza@latest
  fd@10
  fzf@0.61
  gh@latest
  just@1
  neovim@latest
  node@lts
  pre-commit@latest
  rg@14
  tmux@3
  uv@latest
  yazi@latest
  zoxide@latest
  kubectl@1
  helm@3
  claude@latest
)

# Iterate over the array and install each package
for package in "${packages[@]}"; do
  echo "Installing $package..."
  mise use -g "$package"
done

echo "→ Installation complete"

# Setup supervisor config
sudo mkdir -p /etc/supervisor/conf.d
sudo cp .devcontainer/supervisor.d/* /etc/supervisor/conf.d/

# Run Tailscale setup
bash .devcontainer/tailscale-setup.sh
