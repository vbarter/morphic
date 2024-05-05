FROM oven/bun:1.1.3-alpine

RUN apk add --no-cache nodejs npm git

RUN git clone https://github.com/vbarter/morphic.git /app && \
  cd /app && \
  git checkout mysearch && \
  git pull && \
  rm -rf .git && \
  bun i && \
  bun next telemetry disable

WORKDIR /app

CMD ["bun", "dev"]
