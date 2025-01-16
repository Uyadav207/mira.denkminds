# Use the official OWASP ZAP stable Docker image as the base
FROM ghcr.io/zaproxy/zaproxy:stable

# Set the environment variables
ENV ZAP_HOST 0.0.0.0

# Expose the dynamic port
EXPOSE 8080

# Use ENTRYPOINT and pass the resolved $PORT dynamically
ENTRYPOINT ["sh", "-c", "zap.sh -daemon -host $ZAP_HOST -port $PORT -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true"]
