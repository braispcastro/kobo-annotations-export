#!/bin/bash

# Configuration
NAME="kobo-annotations-export"
PORT="8003"
DATA_PATH="$PWD/data"

echo "Updating Kobo Annotations Viewer (SSR)..."

# Ensure data directory exists
if [ ! -d "$DATA_PATH" ]; then
    echo "Creating empty data directory at $DATA_PATH"
    mkdir -p "$DATA_PATH"
fi

# Stop and remove existing container
docker stop $NAME 2>/dev/null
docker rm $NAME 2>/dev/null

# Build the new image
echo "Building Docker image..."
docker build -t $NAME .

# Run the container
echo "Starting container on port $PORT..."
docker run -d \
  --name $NAME \
  -p $PORT:4321 \
  -v "$DATA_PATH":/app/data \
  --restart unless-stopped \
  $NAME

echo "----------------------------------------------------------------"
echo "Server active at: http://$(hostname -I | awk '{print $1}'):$PORT"
echo "Place your backup folders inside: $DATA_PATH"
echo "----------------------------------------------------------------"
