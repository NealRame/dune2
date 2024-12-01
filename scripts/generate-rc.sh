#! /usr/bin/env bash

###############################################################################
### Create dune2 resources

set -e
set -o pipefail
set -u

export SOURCES_DIR="${SOURCES_DIR:-$PWD}"

source "$SOURCES_DIR/scripts/env.sh"

# Build dune2-rc-toolkit tools
pushd "$DUNE2_ASSETS_DIR"
    cargo build --package dune2-assets-toolkit --release
    export DUNE2_ASSETS_TOOLKIT="$PWD/target/release/dune2-assets-toolkit"
popd

# Create dune2 resources file
pushd "$DUNE2_DATA_DIR"
    "$DUNE2_ASSETS_TOOLKIT" \
        create "$DUNE2_ASSETS_DIR/dune2.assets.toml" \
            --force-overwrite \
            --output-file "$SOURCES_DIR/packages/dune2/lib/assets/dune2_assets.bin"
popd
