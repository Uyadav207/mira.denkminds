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

# Expose the default ZAP port
EXPOSE 8080

# Start ZAP in daemon mode with reverse proxy handling and debug logs
ENTRYPOINT ["sh", "-c", "zap.sh -daemon -host 0.0.0.0 -port ${PORT} \
     -config api.addrs.addr.name=.* \
     -config api.addrs.addr.regex=true \
     -config api.disablekey=true \
     -config network.localServers.mainProxy.behindNat=true \
     -config network.localServers.mainProxy.host=0.0.0.0 \
     -config network.localServers.mainProxy.port=${PORT} \
     -config network.connection.proxy.chain.enabled=true \
     -config network.connection.proxy.chain.hostHeader=true \
     -config network.connection.proxy.chain.tls=true \
     -config network.connection.passThrough.name=.* \
     -config logger.level=DEBUG"]