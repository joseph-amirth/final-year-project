/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Model} from './model';
import {TextDecoder} from 'util';

const utf8Decoder = new TextDecoder();

@Info({title: 'GlobalModelUpdate', description: 'Smart contract for updating the global model'})
export class GlobalModelUpdateContract extends Contract {

    @Transaction(true)
    public async InitGlobalModel(ctx: Context): Promise<void> {
        const model: Model = {
            ID: 'globalModel',
            prevCID: '',
            CID: 'QmdsDpteXxFXQZSPZSjvJiC4gaC6bmjNeQQwaadqfXQ59k',
        };

        model.doctype = 'model';
        await ctx.stub.putState(model.ID, Buffer.from(stringify(sortKeysRecursive(model))));
        console.info('Initial global model added to the ledger');
    }

    // UpdateGlobalModel updates the CID of the global model in the world state.
    @Transaction(true)
    public async UpdateGlobalModel(ctx: Context, CID: string): Promise<void> {
        const oldModel: Model = await this.GetGlobalModel(ctx);
        const prevCID: string = oldModel.CID;

        const newModel: Model = {
            ID: 'globalModel',
            prevCID: prevCID,
            CID: CID,
        };

        newModel.doctype = 'model';
        await ctx.stub.putState(newModel.ID, Buffer.from(stringify(sortKeysRecursive(newModel))));
    }

    // GetGlobalModel returns the CID of the global model currently in the world state.
    @Transaction(false)
    public async GetGlobalModel(ctx: Context): Promise<Model> {
        const bytes: Uint8Array = await ctx.stub.getState('globalModel');
        const json: string = utf8Decoder.decode(bytes);
        const globalModel: Model = JSON.parse(json);
        return globalModel;
    }

}

