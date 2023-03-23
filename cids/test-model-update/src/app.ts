/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

import { create } from 'ipfs-core';
import all from 'it-all';
import { concat as uint8ArrayConcat } from 'uint8arrays/concat';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';

import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));
// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'User1@org1.example.com-cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();

// IPFS connection.
const ipfs = await create();

async function main(): Promise<void> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
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

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName, 'ModelUpdateContract');

        let modelStr;

        // Test InitModel and integrity of data stored in IPFS
        console.log('\n--> Testing InitModel and integrity of data stored in IPFS');
        await initModel(contract);

        modelStr = await getModel(contract);

        const oldModelPath = path.resolve(__dirname, 'old-model.pkl');
        const oldModel = await fs.readFile(oldModelPath);
        const oldModelStr = oldModel.toString();

        assert(modelStr == oldModelStr);
        console.log('\n*** Data integrity is preserved');

        // Test UpdateModel and integrity of data stored in IPFS
        console.log('\n--> Testing UpdateModel and integrity of data stored in IPFS');
        const newModelPath = path.resolve(__dirname, 'new-model.pkl');
        const newModel = await fs.readFile(newModelPath);
        const newModelStr = newModel.toString();

        await updateModel(contract, newModelStr);
        modelStr = await getModel(contract);

        assert(modelStr == newModelStr);
        console.log('\n*** Data integrity is preserved');
    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
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

async function initModel(contract: Contract): Promise<void> {
    console.log('\n--> Submitting InitModel transaction');
    await contract.submitTransaction('InitModel');
    console.log('*** Transaction committed successfully');
}

async function updateModel(contract: Contract, modelStr: string): Promise<string> {
    console.log('\n--> Submitting UpdateModel transaction');

    const result = await ipfs.add(modelStr);
    const cid = result.cid.toString();

    console.log(`CID of the new model: ${cid}`);

    await contract.submitTransaction(
        'UpdateModel',
        cid,
    );

    console.log('*** Transaction committed successfully');
    return cid;
}

async function getModel(contract: Contract): Promise<string> {
    console.log('\n--> Getting the model CID');

    const resultBytes = await contract.evaluateTransaction('GetModel');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);

    const cid: string = result.CID;
    console.log('*** Model CID:', cid);

    const modelString = uint8ArrayConcat(await all(ipfs.cat(cid)));
    return uint8ArrayToString(modelString);
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}

function assert(condition: boolean): void {
    if (!condition) {
        throw Error('Assertion Error');
    }
}

