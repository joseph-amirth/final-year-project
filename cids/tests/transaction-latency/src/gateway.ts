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
const mspId = envOrDefault('MSP_ID', 'Org2MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'fabric-network', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org2.example.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@org2.example.com', 'msp', 'signcerts', 'User1@org2.example.com-cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org2.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:9051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org2.example.com');

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
            return { deadline: Date.now() + 50000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 150000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 50000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 600000 }; // 1 minute
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

