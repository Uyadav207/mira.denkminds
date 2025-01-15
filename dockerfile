FROM ghcr.io/zaproxy/zaproxy:stable

USER zap
WORKDIR /zap

# Create a wrapper script to run ZAP baseline
RUN echo '#!/bin/bash\n\
while true; do\n\
  if [ -n "$TARGET_URL" ]; then\n\
    zap-baseline.py -t "$TARGET_URL" -J -r baseline-report.json\n\
  fi\n\
  sleep 30\n\
done' > /zap/wrapper.sh && \
chmod +x /zap/wrapper.sh

EXPOSE 8080

ENV \
    ZAP_PORT=8080 \
    ZAP_HOST=0.0.0.0

CMD ["/zap/wrapper.sh"]