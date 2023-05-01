FROM node:18-alpine as ds-node
WORKDIR /ds-node
COPY ds-node/package*.json .
COPY ds-node/tsconfig.json .
COPY ds-node/src ./src
RUN npm install; exit 0

FROM hyperledger/fabric-peer:latest

# Install npm and python.
RUN apk update && \
    apk add --update nodejs npm && \
    apk add --no-cache python3 && \
    python3 -m ensurepip && \
    pip3 install --upgrade pip

# Copy ds-node files.
COPY --from=ds-node /ds-node /ds-node

# Copy py-worker files and install requirements.
WORKDIR /py-worker
COPY py-worker .
RUN pip3 install -r requirements.txt

# Copy start scripts.
COPY start*.sh /

# Expose 3000 for ds-node.
EXPOSE 3000/tcp
EXPOSE 5000/tcp

CMD [ "/bin/sh", "/start.sh" ]
