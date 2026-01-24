FROM node:24-trixie-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      python3 && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY . .
RUN npm install -g @pixlcore/xyrun

CMD ["xyrun", "node", "index.js"]
