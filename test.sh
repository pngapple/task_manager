#!/bin/bash

# Function to clean up when script is terminated
cleanup() {
    echo "Shutting down all processes..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT

# Start DB server in docker
echo "Starting PostgreSQL in Docker..."
docker run --rm -p 5432:5432 -e POSTGRES_HOST_AUTH_METHOD=trust postgres &

# Give the database a moment to start up
echo "Waiting for PostgreSQL to initialize..."
sleep 5

# Start website
echo "Starting website with npm run dev..."
npm run dev &

# Wait for all background processes
echo "All services started. Press Ctrl+C to stop everything."
wait