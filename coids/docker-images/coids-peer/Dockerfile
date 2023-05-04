FROM node:18-alpine as ds-node
WORKDIR /ds-node
COPY ds-node/package*.json .
COPY ds-node/tsconfig.json .
COPY ds-node/src ./src
RUN npm install; exit 0

FROM hyperledger/fabric-peer:latest

# Install Node.js and NPM.
RUN apk update && apk add --update nodejs npm

# Copy ds-node files.
COPY --from=ds-node /ds-node /ds-node

# Copy start scripts.
COPY start*.sh /

# Expose 3000 for the Node server.
EXPOSE 3000/tcp

CMD [ "/bin/sh", "/start.sh" ]
