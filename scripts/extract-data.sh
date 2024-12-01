#! /usr/bin/env bash

###############################################################################
### Extract dune2 data

set -e
set -o pipefail
set -u

export SOURCES_DIR="${SOURCES_DIR:-$PWD}"

source "$SOURCES_DIR/scripts/env.sh"

# Build dune2-unpak tools
pushd "$DUNE2_ASSETS_DIR"
    cargo build --package dune2-unpak --release
    export DUNE2_UNPAK="$PWD/target/release/dune2-unpak"
popd

# Extract data files
pushd "$DUNE2_DATA_DIR"
    rm -rf DUNE
    unzip -p "$DUNE2_ZIP_ARCHIVE_PATH" "$DUNE2_ZIP_ARCHIVE_DUNE_PAK_PATH" \
        | "$DUNE2_UNPAK" -d DUNE
popd
