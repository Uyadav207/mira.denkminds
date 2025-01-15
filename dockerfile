FROM ghcr.io/zaproxy/zaproxy:stable

USER zap
WORKDIR /zap

EXPOSE 8080

# Start ZAP with proper SSL and redirect handling
CMD ["zap.sh", \
    "-daemon", \
    "-host", "0.0.0.0", \
    "-port", "8080", \
    "-config", "api.addrs.addr.name=.*", \
    "-config", "api.addrs.addr.regex=true", \
    "-config", "api.disablekey=true", \
    "-config", "network.ssl.renegotiation=true", \
    "-config", "connection.timeoutInSecs=600", \
    "-config", "network.ssl.allowUnsafeLegacyRenegotiation=true", \
    "-config", "network.ssl.clientauth=false"]