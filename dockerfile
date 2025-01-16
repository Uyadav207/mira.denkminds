# Use the official OWASP ZAP stable Docker image as the base
FROM ghcr.io/zaproxy/zaproxy:stable

# Set environment variables
# The default Render environment provides a $PORT variable
# Use this to dynamically bind the port ZAP listens to
ENV PORT 8080
ENV ZAP_HOST 0.0.0.0

# Expose the dynamic port or fallback to 8080
EXPOSE ${PORT}

# Run ZAP with the specified dynamic port
CMD ["zap.sh", "-daemon", "-host", "${ZAP_HOST}", "-port", "${PORT}", "-config", "api.addrs.addr.name=.*", "-config", "api.addrs.addr.regex=true"]
