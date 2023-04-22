/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers, Gateway, Network } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';
import { infoln, envOrDefault } from './utils.js';

import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('CORE_PEER_LOCALMSPID', 'Org1MSP');

// Path to peer directory.
const cryptoPath = path.resolve('/', 'etc', 'hyperledger', 'fabric');

// Path to users directory.
const usersPath = path.resolve('/', 'etc', 'users');

const user = (() => {
    if (mspId == 'Org1MSP')
        return 'User1@org1.example.com';
    if (mspId == 'Org2MSP')
        return 'User1@org2.example.com';
    if (mspId == 'Org3MSP')
        return 'User1@org3.example.com';
    return '';
})();

// Path to user private key directory.
const keyDirectoryPath = path.resolve(usersPath, user, 'msp', 'keystore');

// Path to user certificate.
const certPath = path.resolve(usersPath, user, 'msp', 'signcerts', `${user}-cert.pem`);

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('CORE_PEER_ADDRESS', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('CORE_PEER_ID', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();

await displayInputParameters();

// The gRPC client connection should be shared by all Gateway connections to this endpoint.
async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

const client: grpc.Client = await newGrpcConnection();

export async function getGateway(): Promise<Gateway> {
    const gateway: Gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });
    return gateway;
}

async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    infoln(`channelName:       ${channelName}`);
    infoln(`chaincodeName:     ${chaincodeName}`);
    infoln(`mspId:             ${mspId}`);
    infoln(`cryptoPath:        ${cryptoPath}`);
    infoln(`keyDirectoryPath:  ${keyDirectoryPath}`);
    infoln(`certPath:          ${certPath}`);
    infoln(`tlsCertPath:       ${tlsCertPath}`);
    infoln(`peerEndpoint:      ${peerEndpoint}`);
    infoln(`peerHostAlias:     ${peerHostAlias}`);
}

