#!/bin/bash
# ==============================================================================
# Daltoon SNI Scanner & Xray-Core Engine - Automated Installer
# GitHub: https://github.com/mdaltoon10/Daltoon-SNI-Scanner
# ==============================================================================

set -e

PORT=${1:-8100}
INSTALL_DIR="/root/Daltoon-SNI-Scanner"

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;32m 🚀 Installing Daltoon SNI Scanner on Port ${PORT}...\033[0m"
echo -e "\033[1;36m========================================================\033[0m"

# 1. Update packages & install dependencies
echo -e "\n\033[1;33m[1/6] Updating system packages & installing prerequisites...\033[0m"
apt-get update -y
apt-get install -y curl wget git unzip build-essential ufw

# 2. Install Node.js 20.x if not installed or outdated
echo -e "\n\033[1;33m[2/6] Checking and installing Node.js 20 LTS...\033[0m"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "Node.js version: $(node -v)"
echo -e "NPM version: $(npm -v)"

# 3. Install PM2 globally
echo -e "\n\033[1;33m[3/6] Installing PM2 process manager...\033[0m"
npm install -g pm2

# 4. Clone or update repository
echo -e "\n\033[1;33m[4/6] Downloading Daltoon SNI Scanner repository...\033[0m"
if [ -d "$INSTALL_DIR" ]; then
    echo "Directory exists. Updating repository..."
    cd "$INSTALL_DIR"
    git reset --hard HEAD
    git pull origin main || true
else
    git clone https://github.com/mdaltoon10/Daltoon-SNI-Scanner.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# 5. Install dependencies and build project
echo -e "\n\033[1;33m[5/6] Installing NPM packages & building dashboard...\033[0m"
npm install
npm run build

# 6. Configure environment and start service with PM2
echo -e "\n\033[1;33m[6/6] Configuring service on Port ${PORT} & starting with PM2...\033[0m"
cat <<EOF > .env
PORT=${PORT}
NODE_ENV=production
EOF

# Stop previous instance if running
pm2 delete daltoon-sni-scanner 2>/dev/null || true

# Start service
PORT=${PORT} pm2 start dist/server.cjs --name "daltoon-sni-scanner" --env PORT=${PORT}
pm2 save
pm2 startup systemd -u root --hp /root || true

# Open firewall port
echo -e "\n\033[1;33m[*] Opening Port ${PORT} in UFW firewall...\033[0m"
ufw allow ${PORT}/tcp || true

# Get Server IP
SERVER_IP=$(curl -s -4 ifconfig.me || curl -s -4 icanhazip.com || echo "YOUR_SERVER_IP")

echo -e "\n\033[1;32m========================================================\033[0m"
echo -e "\033[1;32m 🎉 Installation Completed Successfully!\033[0m"
echo -e "\033[1;36m 🌐 Dashboard URL: http://${SERVER_IP}:${PORT}\033[0m"
echo -e "\033[1;36m========================================================\033[0m"
echo -e "To manage the application:"
echo -e "  - View Logs:    pm2 logs daltoon-sni-scanner"
echo -e "  - Status:       pm2 status daltoon-sni-scanner"
echo -e "  - Restart:      pm2 restart daltoon-sni-scanner"
echo -e "  - One-line Update: bash <(curl -sSL https://raw.githubusercontent.com/mdaltoon10/Daltoon-SNI-Scanner/main/update.sh)"
echo -e "\033[1;32m========================================================\033[0m"
