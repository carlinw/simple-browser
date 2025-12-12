#!/bin/bash
set -e

echo "Building Simple Interpreter..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Install Playwright browsers if needed
if ! npx playwright --version > /dev/null 2>&1; then
  echo "Installing Playwright browsers..."
  npx playwright install
fi

# Run tests
echo "Running tests..."
npx playwright test

echo "Build complete!"
