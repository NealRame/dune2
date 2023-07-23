#! /usr/bin/env bash

###############################################################################
### Extract dune2 data

set -e
set -o pipefail
set -u

export SOURCES_DIR="${SOURCES_DIR:-$PWD}"

source "$SOURCES_DIR/scripts/env.sh"

# Build wasm package
pushd "$DUNE2_RESOURCES_DIR"
    "$SOURCES_DIR/node_modules/.bin/wasm-pack" \
        build packages/dune2 \
            --release \
            --scope nealrame \
            -- --features wasm
popd
