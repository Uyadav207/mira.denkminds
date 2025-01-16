# Use the official OWASP ZAP stable Docker image as the base
FROM ghcr.io/zaproxy/zaproxy:stable

# Set the environment variable for Render's dynamic port
ENV PORT=8080

# Expose the dynamic port for Render
EXPOSE $PORT

# Default command to start ZAP
# -daemon: Run ZAP in daemon mode (headless)
# -port: Bind ZAP to the port specified by Render
# -config api.disablekey=true: Disable the API key for simplicity (optional; configure if security is a concern)
# -config proxy.localonly=true: Restrict ZAP to only listen locally
# -config server.redirect=false: Disable automatic HTTP-to-HTTPS redirection
CMD ["zap.sh", "-daemon", "-port", "$PORT", "-config", "api.disablekey=true", "-config", "proxy.localonly=true", "-config", "server.redirect=false"]
