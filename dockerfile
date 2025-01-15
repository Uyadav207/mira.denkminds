# Use the ZAP stable Docker image
FROM ghcr.io/zaproxy/zaproxy:stable

# Switch to root user to install any additional dependencies
USER root

# Install required dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Switch back to zap user
USER zap

# Set working directory
WORKDIR /zap

# Expose ZAP default port
EXPOSE 8080

# Start ZAP in daemon mode
CMD ["zap.sh", "-daemon", "-host", "0.0.0.0", "-port", "8080", \
     "-config", "api.addrs.addr.name=.*", \
     "-config", "api.addrs.addr.regex=true", \
     "-config", "api.disablekey=true", \
     "-config", "network.localServers.mainProxy.behindNat=true", \
     "-config", "network.localServers.mainProxy.host=0.0.0.0", \
     "-config", "network.connection.passThrough.name=.*", \
     "-config", "logger.level=INFO"]