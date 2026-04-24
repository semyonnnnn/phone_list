#!/bin/bash

cd "$(dirname "$0")/.."

# 1. The "Setup" logic: Create venv if missing
if [ ! -d "venv" ]; then
    echo "📦 Initializing environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

# 2. The "NPM Alias" logic: Execute the shell
echo "🚀 Entering Neural Lattice Environment..."
exec bash --rcfile <(echo "source ~/.bashrc; source venv/bin/activate; echo 'Ready.'")