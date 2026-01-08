# Production build for SynthMind Backend
FROM node:20-slim

WORKDIR /app

# Install k6, git, and Playwright system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    gnupg2 \
    curl \
    git \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    && curl -s https://dl.k6.io/key.gpg | gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --import \
    && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list \
    && apt-get update && apt-get install -y k6 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

# Install Playwright Chromium binary
RUN npx playwright install chromium

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
