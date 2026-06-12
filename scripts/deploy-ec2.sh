#!/usr/bin/env bash
set -euo pipefail

: "${APP_NAME:?APP_NAME is required}"
: "${APP_DIR:?APP_DIR is required}"
: "${APP_PORT:?APP_PORT is required}"
: "${RELEASE_ID:?RELEASE_ID is required}"
: "${ARCHIVE_PATH:?ARCHIVE_PATH is required}"

if [[ "$APP_DIR" == "/" || -z "$APP_DIR" ]]; then
  echo "Invalid APP_DIR: $APP_DIR" >&2
  exit 1
fi

if [[ ! "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Invalid RELEASE_ID: $RELEASE_ID" >&2
  exit 1
fi

load_node_runtime() {
  if command -v node >/dev/null 2>&1 && command -v pm2 >/dev/null 2>&1; then
    return
  fi

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    . "$NVM_DIR/nvm.sh"
  fi
}

load_node_runtime

if ! command -v node >/dev/null 2>&1; then
  echo "node is required on the EC2 instance" >&2
  exit 1
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 is required on the EC2 instance" >&2
  exit 1
fi

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "Release archive not found: $ARCHIVE_PATH" >&2
  exit 1
fi

RELEASES_DIR="$APP_DIR/releases"
SHARED_DIR="$APP_DIR/shared"
CURRENT_LINK="$APP_DIR/current"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"

if [[ ! -d "$APP_DIR" ]]; then
  APP_PARENT="$(dirname "$APP_DIR")"
  if [[ -w "$APP_PARENT" ]]; then
    mkdir -p "$APP_DIR"
  elif command -v sudo >/dev/null 2>&1; then
    sudo mkdir -p "$APP_DIR"
    sudo chown "$(id -un):$(id -gn)" "$APP_DIR"
  else
    echo "Cannot create $APP_DIR. Create it manually or install sudo." >&2
    exit 1
  fi
fi

if [[ ! -w "$APP_DIR" ]]; then
  if command -v sudo >/dev/null 2>&1; then
    sudo chown -R "$(id -un):$(id -gn)" "$APP_DIR"
  else
    echo "$APP_DIR is not writable by $(id -un)" >&2
    exit 1
  fi
fi

mkdir -p "$RELEASES_DIR" "$SHARED_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

tar -xzf "$ARCHIVE_PATH" -C "$RELEASE_DIR"

if [[ ! -f "$RELEASE_DIR/server.js" ]]; then
  echo "server.js was not found in the release archive" >&2
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

set -a
if [[ -f "$SHARED_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  . "$SHARED_DIR/.env"
fi
set +a

export NODE_ENV=production
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="$APP_PORT"
export DEPLOYMENT_VERSION="$RELEASE_ID"

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start "$CURRENT_LINK/server.js" --name "$APP_NAME" --cwd "$CURRENT_LINK"
fi

pm2 save
rm -f "$ARCHIVE_PATH"

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
  | sort -rn \
  | tail -n +6 \
  | cut -d' ' -f2- \
  | xargs -r rm -rf
