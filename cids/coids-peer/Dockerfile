FROM node:18-alpine as ds-client
WORKDIR /ds-client
COPY package*.json .
COPY tsconfig.json .
COPY src ./src
RUN npm install

FROM hyperledger/fabric-peer:latest

COPY --from=ds-client /ds-client /ds-client
COPY start*.sh /

RUN apk update && apk add --update nodejs npm

EXPOSE 3000/tcp
