FROM zaproxy/zap-stable

# Expose the ZAP web server port
EXPOSE 8080

# Set ZAP as a daemon with required configurations
CMD ["zap.sh", "-daemon", "-host", "0.0.0.0", "-port", "8080", \
     "-config", "connection.timeoutInSecs=60", \
     "-config", "api.addrs.addr.name=.*", \
     "-config", "api.disablekey=true", \
     "-config", "api.addrs.addr.regex=true", \
     "-config", "ascan.attackStrength=HIGH", \
     "-config", "connection.timeoutInMs=60000", \
     "-config", "ascan.delayInMs=500", \
     "-config", "ascan.maxThreads=10"]
