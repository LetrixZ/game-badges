#!/usr/bin/env bash
CLI_LOCATION="$(pwd)/cli"
echo "Building plugin in $(pwd)"
sudo -E $CLI_LOCATION/decky plugin build $(pwd)
