#! /usr/bin/env bash

set -e
set -o pipefail
set -u

export DUNE2_DATA_DIR="${DUNE2_DATA_DIR:-$PWD/data}"
export DUNE2_RESOURCES_DIR="${DUNE2_DIR:-$PWD/packages/dune2-resources}"

[ -f "$PWD/.dune2.env" ] && source .dune2.env
