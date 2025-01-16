# Use the ZAP stable Docker image as the base
FROM ghcr.io/zaproxy/zaproxy:stable

# Switch to root user to install additional dependencies (if necessary)
USER root

# Install required dependencies (optional; remove if not needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Switch back to zap user for security
USER zap

# Set the working directory
WORKDIR /zap

# Expose a default port for compatibility and local testing
EXPOSE 8080

# Start ZAP in daemon mode with dynamic port binding, disable auto-updates and OAST
CMD ["sh", "-c", "echo Detected PORT: ${PORT} && \
    zap.sh -daemon -host 0.0.0.0 -port ${PORT:-8080} \
    -config api.addrs.addr.name=.* \
    -config api.addrs.addr.regex=true \
    -config api.disablekey=true \
    -config network.localServers.mainProxy.behindNat=true \
    -config network.localServers.mainProxy.host=0.0.0.0 \
    -config extension.autoupdate.enabled=false \
    -config extension.oast.enabled=false \
    -config logger.level=DEBUG && \
    tail -f /zap/zap.log"]