FROM oven/bun:latest
RUN apk add --no-cache docker-cli
WORKDIR /app/backend
COPY ./backend/package.json ./backend/bun.lockb ./
RUN bun install --force
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "bun run start:prod"]
