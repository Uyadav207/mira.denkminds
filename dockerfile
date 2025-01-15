FROM ghcr.io/zaproxy/zaproxy:stable

USER root

# Install required packages
RUN apt-get update && apt-get install -q -y --fix-missing \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Switch back to zap user
USER zap

# Set working directory
WORKDIR /zap

# Copy API script (you'll need to create this)
COPY ./zap_baseline_api.py /zap/

EXPOSE 8080

# Start ZAP daemon and API
CMD ["zap.sh", "-daemon", "-host", "0.0.0.0", "-port", "8080", "-config", "api.addrs.addr.name=.*", "-config", "api.addrs.addr.regex=true", "-config", "api.disablekey=true"]