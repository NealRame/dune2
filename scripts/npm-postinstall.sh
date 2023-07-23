#! /usr/bin/env bash

set -e
set -o pipefail
set -u

export SOURCES_DIR="${SOURCES_DIR:-$PWD}"

source "$SOURCES_DIR/scripts/extract-data.sh"
source "$SOURCES_DIR/scripts/generate-rc.sh"
source "$SOURCES_DIR/scripts/wasm-pack.sh"
