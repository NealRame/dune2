#! /usr/bin/env bash

set -e
set -o pipefail
set -u

export DUNE2_DATA_DIR="${DUNE2_DATA_DIR:-$PWD/data}"
export DUNE2_ASSETS_DIR="${DUNE2_DIR:-$PWD/packages/dune2-assets}"

if [ -f "$PWD/.env" ];
then
    source "$PWD/.env"
fi
