# Use the official OWASP ZAP stable Docker image as the base
FROM ghcr.io/zaproxy/zaproxy:stable

# Switch to root user to install additional dependencies if necessary
USER root

# Install required dependencies (optional; remove if not needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Remove all existing extensions to prevent ZAP from loading any that could open additional ports
RUN rm -f /zap/extensions/*.zap

# Switch back to the non-root 'zap' user for security
USER zap

# Set the working directory
WORKDIR /zap

# Expose port 10000 for Render.com compatibility
EXPOSE 10000

# Start ZAP in foreground mode, binding exclusively to port 10000
CMD ["zap.sh", "-host", "0.0.0.0", "-port", "10000", \
    "-config", "api.addrs.addr.name=.*", \
    "-config", "api.addrs.addr.regex=true", \
    "-config", "api.disablekey=true", \
    "-config", "network.localServers.mainProxy.behindNat=true", \
    "-config", "network.localServers.mainProxy.host=0.0.0.0", \
    "-config", "logger.level=DEBUG"]
