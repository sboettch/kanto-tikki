#!/bin/bash
# Stage the Kanto Tikki app into deploy/public — app files only, no scratch.
set -e
cd "$(dirname "$0")"
rm -rf public && mkdir -p public/essence public/portraits public/fork/portraits
cp ../*.html ../*.css ../*.js ../robots.txt public/ 2>/dev/null || cp ../index.html ../kanto.css ../kanto*.js public/
cp ../essence/*.webp ../essence/*.mp4 ../essence/*.webm ../essence/*.json public/essence/ 2>/dev/null || true
cp ../portraits/*.webp ../portraits/*.json public/portraits/ 2>/dev/null || true
if [ -d ../fork ]; then
  cp ../fork/*.html ../fork/*.css ../fork/*.js public/fork/ 2>/dev/null || true
  cp ../fork/portraits/* public/fork/portraits/ 2>/dev/null || true
fi
echo "staged: $(find public -type f | wc -l | tr -d ' ') files, $(du -sh public | cut -f1)"
