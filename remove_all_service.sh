#!/bin/bash

# 要釋放的 port 清單
PORTS=(8545 8081 8083 8082 3000)

for PORT in "${PORTS[@]}"; do
  echo "Checking port: $PORT"
  PID=$(lsof -t -i :$PORT)
  if [ -n "$PID" ]; then
    echo "Killing process $PID on port $PORT"
    kill -9 $PID
  else
    echo "Port $PORT is not in use"
  fi
done

echo "All specified ports have been processed."
