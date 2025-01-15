FROM ghcr.io/zaproxy/zaproxy:stable

USER zap
WORKDIR /zap

EXPOSE 8080

# Start ZAP in daemon mode with API enabled
CMD ["zap.sh", "-daemon", "-host", "0.0.0.0", "-port", "8080", "-config", "api.addrs.addr.name=.*", "-config", "api.addrs.addr.regex=true", "-config", "api.disablekey=true"]