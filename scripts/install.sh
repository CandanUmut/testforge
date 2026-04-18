#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  TestForge Agent Installer
#  Installs the reporter script, background agent, and systemd
#  service on a Linux host (Debian/Ubuntu, RHEL/CentOS, Arch).
# ──────────────────────────────────────────────────────────────
set -euo pipefail

INSTALL_DIR="/opt/testforge"
CONFIG_DIR="${INSTALL_DIR}/config"
LOG_DIR="${INSTALL_DIR}/logs"
AGENT_DIR="${INSTALL_DIR}/agent"
RESULTS_DIR="${INSTALL_DIR}/results"
SERVICE_NAME="testforge-agent"
REPO_RAW="https://raw.githubusercontent.com/CandanUmut/testforge/main/scripts"

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC}  $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Root check ────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    err "This installer must be run as root (try: sudo bash install.sh)"
fi

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         TestForge Agent Installer                ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check prerequisites ───────────────────────────────────
info "Checking prerequisites..."

command -v python3 >/dev/null 2>&1 || err "python3 is not installed. Install it first."
ok "python3 found: $(python3 --version 2>&1)"

command -v pip3 >/dev/null 2>&1 || {
    warn "pip3 not found, attempting to install..."
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update -qq && apt-get install -y -qq python3-pip
    elif command -v yum >/dev/null 2>&1; then
        yum install -y python3-pip
    elif command -v pacman >/dev/null 2>&1; then
        pacman -Sy --noconfirm python-pip
    else
        err "Cannot install pip3 automatically. Install it manually."
    fi
}
ok "pip3 found: $(pip3 --version 2>&1 | head -1)"

# ── 2. Create directory structure ─────────────────────────────
info "Creating directory structure..."

mkdir -p "${AGENT_DIR}"
mkdir -p "${LOG_DIR}"
mkdir -p "${CONFIG_DIR}"
mkdir -p "${RESULTS_DIR}"

ok "Directories created under ${INSTALL_DIR}"

# ── 3. Install Python dependencies ───────────────────────────
info "Installing Python dependencies..."

pip3 install --quiet --break-system-packages requests 2>/dev/null \
    || pip3 install --quiet requests

ok "Python 'requests' module installed"

# ── 4. Download agent and reporter scripts ────────────────────
info "Downloading TestForge scripts..."

download_script() {
    local name="$1"
    local dest="${AGENT_DIR}/${name}"

    if curl -fsSL "${REPO_RAW}/${name}" -o "${dest}" 2>/dev/null; then
        chmod +x "${dest}"
        ok "Downloaded ${name}"
    else
        warn "Could not download ${name} from GitHub."
        # Check if the script exists locally (e.g., running from the repo)
        local local_path
        local_path="$(cd "$(dirname "$0")" && pwd)/${name}"
        if [[ -f "${local_path}" ]]; then
            cp "${local_path}" "${dest}"
            chmod +x "${dest}"
            ok "Copied ${name} from local directory"
        else
            err "Cannot find ${name}. Place it in ${AGENT_DIR} manually."
        fi
    fi
}

download_script "testforge_reporter.py"
download_script "testforge_agent.py"

# ── 5. Prompt for API URL and key ─────────────────────────────
echo ""
info "Configure your TestForge connection."
echo ""

read -rp "  TestForge API URL (e.g. https://xyz.supabase.co): " TF_URL
read -rp "  API Key (tf_xxx...): " TF_API_KEY
read -rp "  Device name (e.g. PX8P-001): " TF_DEVICE
read -rp "  Firmware version (e.g. v3.2.1) [optional]: " TF_FW_VERSION
read -rp "  Organisation ID [optional]: " TF_ORG_ID

# Validate required fields
[[ -z "${TF_URL}" ]] && err "API URL is required."
[[ -z "${TF_API_KEY}" ]] && err "API Key is required."
[[ -z "${TF_DEVICE}" ]] && err "Device name is required."

# ── 6. Write config file ─────────────────────────────────────
CONFIG_FILE="${CONFIG_DIR}/agent.conf"
info "Writing config to ${CONFIG_FILE}..."

cat > "${CONFIG_FILE}" <<CONF
[testforge]
url = ${TF_URL}
api_key = ${TF_API_KEY}
org_id = ${TF_ORG_ID}
device_name = ${TF_DEVICE}
firmware_version = ${TF_FW_VERSION}
suite_name = auto-detected
heartbeat_interval = 300
watch_dir = ${RESULTS_DIR}
log_file = ${LOG_DIR}/agent.log
adb_monitor = false
CONF

chmod 600 "${CONFIG_FILE}"
ok "Config written (permissions: 600)"

# ── 7. Create systemd service ────────────────────────────────
info "Creating systemd service..."

cat > "/etc/systemd/system/${SERVICE_NAME}.service" <<SVC
[Unit]
Description=TestForge Agent — heartbeats, file watching, device monitoring
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 ${AGENT_DIR}/testforge_agent.py --config ${CONFIG_FILE}
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
WorkingDirectory=${INSTALL_DIR}

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=${LOG_DIR} ${RESULTS_DIR}
PrivateTmp=true

[Install]
WantedBy=multi-user.target
SVC

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}" --quiet
ok "systemd service created and enabled"

# ── 8. Start the service ─────────────────────────────────────
info "Starting ${SERVICE_NAME}..."
systemctl start "${SERVICE_NAME}"

sleep 2
if systemctl is-active --quiet "${SERVICE_NAME}"; then
    ok "Service is running"
else
    warn "Service may not have started. Check: journalctl -u ${SERVICE_NAME} -f"
fi

# ── 9. Completion banner ─────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║              TestForge Agent — Installed                ║${NC}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "║                                                          ║"
echo -e "║  ${GREEN}Install dir:${NC}   ${INSTALL_DIR}                          ║"
echo -e "║  ${GREEN}Config:${NC}        ${CONFIG_FILE}              ║"
echo -e "║  ${GREEN}Watch dir:${NC}     ${RESULTS_DIR}                   ║"
echo -e "║  ${GREEN}Logs:${NC}          ${LOG_DIR}/agent.log               ║"
echo -e "║                                                          ║"
echo -e "║  ${CYAN}Useful commands:${NC}                                       ║"
echo -e "║    systemctl status ${SERVICE_NAME}                  ║"
echo -e "║    journalctl -u ${SERVICE_NAME} -f                 ║"
echo -e "║    systemctl restart ${SERVICE_NAME}                 ║"
echo -e "║                                                          ║"
echo -e "║  ${CYAN}Manual report:${NC}                                         ║"
echo -e "║    python3 ${AGENT_DIR}/testforge_reporter.py \\              ║"
echo -e "║      --junit-xml results.xml --device-name ${TF_DEVICE}     ║"
echo -e "║                                                          ║"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
