/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Signature} from './signature';
import {TextDecoder} from 'util';

const utf8Decoder = new TextDecoder();

@Info({title: 'SignatureAdd', description: 'Smart contract for adding signatures'})
export class SignatureAddContract extends Contract {

    @Transaction()
    public async InitSignatureDB(ctx: Context): Promise<void> {
        const signatures: Signature[] = [
            {
                ID: 'signature0',
                CID: 'QmdsDpteXxFXQZSPZSjvJiC4gaC6bmjNeQQwaadqfXQ59k',
            },
            {
                ID: 'signature1',
                CID: 'QmdsDpteXxFXQZSPZSjvJiC4gaC6bmjNeQQwaadqfXQ59k',
            },
            {
                ID: 'signature2',
                CID: 'QmdsDpteXxFXQZSPZSjvJiC4gaC6bmjNeQQwaadqfXQ59k',
            },
            {
                ID: 'signature3',
                CID: 'QmdsDpteXxFXQZSPZSjvJiC4gaC6bmjNeQQwaadqfXQ59k',
            },
        ];

        const signatureCount = signatures.length;
        ctx.stub.putState('signatureCount', Buffer.from(stringify({
            SignatureCount: signatureCount,
        })));

        for (const signature of signatures) {
            signature.doctype = 'signature';
            await ctx.stub.putState(signature.ID, Buffer.from(stringify(sortKeysRecursive(signature))));
            console.info(`Signature ${signature.ID} initialized`);
        }
    }

    // GetSignatureCount returns the number of signatures currently in the world state.
    @Transaction(false)
    @Returns('number')
    public async GetSignatureCount(ctx: Context): Promise<number> {
        const bytes = await ctx.stub.getState('signatureCount');
        const json = utf8Decoder.decode(bytes);
        const result = JSON.parse(json);
        return result.SignatureCount;
    }

    // AddSignature adds a new signature to the world state with its CID in IPFS.
    @Transaction()
    public async AddSignature(ctx: Context, cid: string): Promise<void> {
        const signatureCount = await this.GetSignatureCount(ctx);
        const id = signatureCount.toString();

        const exists = await this.SignatureExists(ctx, id);
        if (exists) {
            throw new Error(`The signature ${id} already exists`);
        }

        const signature: Signature = {
            ID: id,
            CID: cid,
        };

        signature.doctype = 'signature';
        await ctx.stub.putState(signature.ID, Buffer.from(stringify(sortKeysRecursive(signature))));
        console.info(`Signature ${signature.ID} added`);

        // increment the signature count
        await ctx.stub.putState('signatureCount', Buffer.from(stringify({
            SignatureCount: (signatureCount + 1),
        })));
    }

    // ReadSignature returns the signature stored in the world state with given id.
    @Transaction(false)
    public async ReadSignature(ctx: Context, id: string): Promise<string> {
        const signatureJSON = await ctx.stub.getState(id); // get the signature from chaincode state
        if (!signatureJSON || signatureJSON.length === 0) {
            throw new Error(`The signature ${id} does not exist`);
        }
        return signatureJSON.toString();
    }

    // SignatureExists returns true when signature with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async SignatureExists(ctx: Context, id: string): Promise<boolean> {
        const signatureJSON = await ctx.stub.getState(id);
        return signatureJSON && signatureJSON.length > 0;
    }

    // GetAllSignatures returns all signatures currently present in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllSignatures(ctx: Context): Promise<string> {
        return await this.GetSignaturesAfter(ctx, 0);
    }

    // GetSignaturesAfter returns all signatures that were inserted after the nth signature.
    @Transaction(false)
    @Returns('string')
    public async GetSignaturesAfter(ctx: Context, n: number): Promise<string> {
        const signatureCount = this.GetSignatureCount(ctx);

        const signatures = [];
        const iterator = await ctx.stub.getStateByRange(`signature${n}`, `signature${signatureCount}`);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            signatures.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(signatures);
    }

}

