#!/usr/bin/env bash
command -v aws >/dev/null 2>&1 || { echo >&2 "You must have the 'aws' command line tool installed."; exit 1; }

target="$1"

case $target in
  stg)
  BUCKET=storyline.knilab.com
  ;;
  prd)
  BUCKET=storyline.knightlab.com
  ;;
  *)
  echo You must specify either 'prd' or 'stg' 1>&2
  exit 1
  ;;
esac

CONFIG_CONTEXT=$target npm run dist && aws s3 sync --acl public-read dist s3://$BUCKET
