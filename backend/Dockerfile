# Use Bun base image to build the app
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb to the container
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --force

# Copy the rest of the application files
COPY . .

# Expose port 8000 for the backend service
EXPOSE 8000

# Run Prisma setup (generate client and deploy migrations) before starting the app
CMD ["sh", "-c", "bun run start:prod"]
