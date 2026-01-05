# Production build for SynthMind Backend
FROM node:20-slim

WORKDIR /app

# Install k6 for performance testing
RUN apt-get update && apt-get install -y ca-certificates gnupg2 curl && \
    curl -s https://dl.k6.io/key.gpg | gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --import && \
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && apt-get install k6

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
