#!/bin/bash
# HomeTikki · KANTO — Standalone Local Runner
# Serves Kanto Tikki on port 8936
cd "$(dirname "$0")"
lsof -ti tcp:8936 | xargs kill 2>/dev/null
sleep 0.4
python3 -m http.server 8936 --bind 127.0.0.1 &
sleep 1
open "http://127.0.0.1:8936/#corridor"
wait
