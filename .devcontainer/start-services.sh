#!/bin/bash
set -e

echo "→ Starting services..."

# Start supervisor service
echo "Starting supervisor service..."
sudo service supervisor start

# Wait for supervisor to be ready
sleep 2

# Check status
if pgrep -x "supervisord" > /dev/null; then
    echo "✓ Supervisor started successfully"
else
    echo "✗ Failed to start supervisor"
    exit 1
fi

echo "→ All services started"