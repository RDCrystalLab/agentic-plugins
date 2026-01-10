#!/bin/bash

# if no .env file exists, create one
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo ".env file created from .env.example"
else
  echo ".env file already exists, skipping creation."
fi
