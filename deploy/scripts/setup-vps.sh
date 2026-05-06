#!/bin/bash

# ============================================
# Million Platform - VPS Initial Setup Script
# Run this on a fresh Ubuntu 22.04 VPS
# ============================================

set -e  # Exit on any error

echo "🚀 Million Platform - VPS Setup Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. System Update
# ============================================
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# ============================================
# 2. Install Essential Tools
# ============================================
echo -e "${YELLOW}🔧 Installing essential tools...${NC}"
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# ============================================
# 3. Install Docker
# ============================================
echo -e "${YELLOW}🐳 Installing Docker...${NC}"

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

echo -e "${GREEN}✅ Docker installed successfully${NC}"

# ============================================
# 4. Install Node.js via NVM
# ============================================
echo -e "${YELLOW}📗 Installing Node.js via NVM...${NC}"

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js LTS
nvm install 20
nvm use 20
nvm alias default 20

echo -e "${GREEN}✅ Node.js $(node -v) installed${NC}"

# ============================================
# 5. Install PM2
# ============================================
echo -e "${YELLOW}⚙️ Installing PM2...${NC}"
npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd -u $USER --hp $HOME

echo -e "${GREEN}✅ PM2 installed${NC}"

# ============================================
# 6. Install Nginx
# ============================================
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo -e "${GREEN}✅ Nginx installed and running${NC}"

# ============================================
# 7. Install Certbot for SSL
# ============================================
echo -e "${YELLOW}🔒 Installing Certbot for SSL...${NC}"
sudo apt install -y certbot python3-certbot-nginx

echo -e "${GREEN}✅ Certbot installed${NC}"

# ============================================
# 8. Setup Firewall
# ============================================
echo -e "${YELLOW}🔥 Configuring UFW firewall...${NC}"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo -e "${GREEN}✅ Firewall configured${NC}"

# ============================================
# 9. Create Project Directory
# ============================================
echo -e "${YELLOW}📁 Creating project directory...${NC}"
sudo mkdir -p /var/www/million-platform
sudo chown -R $USER:$USER /var/www/million-platform

# Create log directories
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

echo -e "${GREEN}✅ Project directory created at /var/www/million-platform${NC}"

# ============================================
# 10. Summary
# ============================================
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}🎉 VPS Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository:"
echo "   cd /var/www/million-platform"
echo "   git clone https://github.com/your-username/million-platform.git ."
echo ""
echo "2. Copy environment files:"
echo "   cp .env.example .env"
echo "   nano .env  # Edit with production values"
echo ""
echo "3. Start Docker containers:"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "4. Build and start applications:"
echo "   npm install"
echo "   npm run build"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "5. Configure Nginx:"
echo "   sudo cp deploy/nginx/nginx.conf /etc/nginx/nginx.conf"
echo "   sudo cp deploy/nginx/sites/* /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "6. Get SSL certificate:"
echo "   sudo certbot --nginx -d your-domain.com -d api.your-domain.com"
echo ""
echo -e "${YELLOW}⚠️  Remember to log out and back in for Docker group to take effect${NC}"
