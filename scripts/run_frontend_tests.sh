#!/bin/bash
echo "Changing directory to digame/frontend"
cd digame/frontend
if [ $? -ne 0 ]; then
  echo "Failed to cd into digame/frontend"
  exit 1
fi

echo "Current directory:"
pwd

echo "Listing contents:"
ls -la

echo "Attempting npm install..."
npm install
if [ $? -ne 0 ]; then
  echo "npm install failed"
  exit 1
fi

echo "Attempting npm test..."
npm test
if [ $? -ne 0 ]; then
  echo "npm test failed"
  exit 1
fi

echo "Script finished successfully"
