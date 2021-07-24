SCRIPT_DIR="$(cd "$(dirname "$0")" >/dev/null && pwd)"
cd "${SCRIPT_DIR}"

BUCKET=vuya.me
BUILD_DIR=.build

aws s3 sync --delete "frontend/${BUILD_DIR}" "s3://${BUCKET}/"
