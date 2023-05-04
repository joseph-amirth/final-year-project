FROM python:3.8-slim-buster

WORKDIR /aggregator

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY utils ./utils

EXPOSE 5000/tcp

# CMD [ "python", "server.py" ]
CMD [ "python", "-m", "flask", "run", "--host=0.0.0.0" ]
