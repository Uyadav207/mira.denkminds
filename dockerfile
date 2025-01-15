FROM ghcr.io/zaproxy/zaproxy:stable

USER root

# Install required packages
RUN apt-get update && apt-get install -q -y --fix-missing \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Flask
RUN pip3 install flask

# Create the API script directly in the container
RUN echo '\
from flask import Flask, request, jsonify\n\
import subprocess\n\
import os\n\
\n\
app = Flask(__name__)\n\
\n\
@app.route("/baseline", methods=["POST"])\n\
def run_baseline_scan():\n\
    try:\n\
        data = request.get_json()\n\
        target_url = data.get("target")\n\
        \n\
        if not target_url:\n\
            return jsonify({"error": "No target URL provided"}), 400\n\
\n\
        # Configure ZAP baseline scan command\n\
        cmd = [\n\
            "zap-baseline.py",\n\
            "-t", target_url,\n\
            "-J", "report.json"  # Output report in JSON format\n\
        ]\n\
        \n\
        # Run the baseline scan\n\
        process = subprocess.run(\n\
            cmd,\n\
            capture_output=True,\n\
            text=True\n\
        )\n\
        \n\
        # Read the report\n\
        with open("report.json", "r") as f:\n\
            report = f.read()\n\
            \n\
        return jsonify({\n\
            "status": "success",\n\
            "report": report,\n\
            "output": process.stdout,\n\
            "errors": process.stderr\n\
        })\n\
\n\
    except Exception as e:\n\
        return jsonify({\n\
            "status": "error",\n\
            "message": str(e)\n\
        }), 500\n\
\n\
if __name__ == "__main__":\n\
    app.run(host="0.0.0.0", port=8080)\n\
' > /zap/zap_baseline_api.py

# Switch back to zap user and set proper permissions
RUN chown zap:zap /zap/zap_baseline_api.py && \
    chmod +x /zap/zap_baseline_api.py

USER zap
WORKDIR /zap

EXPOSE 8080

# Start both ZAP daemon and the Flask API
CMD python3 /zap/zap_baseline_api.py