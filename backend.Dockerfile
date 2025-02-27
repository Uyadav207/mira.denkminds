FROM oven/bun:latest
WORKDIR /app/backend
COPY ./backend/package.json ./backend/bun.lockb ./
RUN bun install --force
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "bun run start:prod"]
