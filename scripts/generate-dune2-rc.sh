#! /usr/bin/env bash

###############################################################################
### Create dune2 resources

set -e
set -o pipefail
set -u

export SOURCES_DIR="${SOURCES_DIR:-$PWD}"

source "$SOURCES_DIR/scripts/env.sh"

# Build dune2-rc-toolkit tools
pushd "$DUNE2_RESOURCES_DIR"
    cargo build --package dune2-rc-toolkit --release
    export DUNE2_RC_TOOLKIT="$PWD/target/release/dune2-rc-toolkit"
popd

# Create dune2 resources file
pushd "$DUNE2_DATA_DIR"
    "$DUNE2_RC_TOOLKIT" \
        create "$DUNE2_RESOURCES_DIR/dune2.rc.toml" \
            --force-overwrite \
            --output-file "$DUNE2_RC_OUTPUT_FILEPATH"
popd
