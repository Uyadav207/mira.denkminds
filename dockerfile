# Use the ZAP stable Docker image
FROM ghcr.io/zaproxy/zaproxy:stable

# Switch to root user to install additional dependencies
USER root

# Install required dependencies (if needed for additional scripts or plugins)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Switch back to zap user for running ZAP securely
USER zap

# Set the working directory
WORKDIR /zap

# Expose a default port for local development and compatibility
EXPOSE 8080

# Dynamically bind to the Render-provided PORT environment variable
ENTRYPOINT ["sh", "-c", "echo Detected PORT: ${PORT} && zap.sh -daemon -host 0.0.0.0 -port ${PORT:-8080} \
     -config api.addrs.addr.name=.* \
     -config api.addrs.addr.regex=true \
     -config api.disablekey=true \
     -config network.localServers.mainProxy.behindNat=true \
     -config network.localServers.mainProxy.host=0.0.0.0 \
     -config logger.level=DEBUG"]