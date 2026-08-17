#!/bin/bash
# ==============================================================================
# Daltoon SNI Scanner - Automated Updater
# GitHub: https://github.com/mdaltoon10/Daltoon-SNI-Scanner
# ==============================================================================

set -e

INSTALL_DIR="/root/Daltoon-SNI-Scanner"

if [ ! -d "$INSTALL_DIR" ]; then
    if [ -f "package.json" ]; then
        INSTALL_DIR="$(pwd)"
    else
        echo -e "\033[1;31m[-] Installation directory not found. Please run install.sh first.\033[0m"
        exit 1
    fi
fi

cd "$INSTALL_DIR"

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;32m 🔄 Updating Daltoon SNI Scanner to Latest Version...\033[0m"
echo -e "\033[1;36m========================================================\033[0m"

echo -e "\n\033[1;33m[1/4] Pulling latest updates from GitHub repository...\033[0m"
git fetch --all
git reset --hard origin/main || git pull origin main

echo -e "\n\033[1;33m[2/4] Updating npm packages...\033[0m"
npm install

echo -e "\n\033[1;33m[3/4] Rebuilding dashboard...\033[0m"
npm run build

echo -e "\n\033[1;33m[4/4] Restarting PM2 process...\033[0m"
pm2 restart daltoon-sni-scanner || pm2 restart all

PORT=$(grep PORT .env 2>/dev/null | cut -d '=' -f2 || echo "8100")
SERVER_IP=$(curl -s -4 ifconfig.me || curl -s -4 icanhazip.com || echo "YOUR_SERVER_IP")

echo -e "\n\033[1;32m========================================================\033[0m"
echo -e "\033[1;32m ✅ Update Completed Successfully!\033[0m"
echo -e "\033[1;36m 🌐 Dashboard URL: http://${SERVER_IP}:${PORT}\033[0m"
echo -e "\033[1;36m========================================================\033[0m"
