/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Model} from './model';

@Info({title: 'ModelUpdate', description: 'Smart contract for updating the model'})
export class ModelUpdateContract extends Contract {

    @Transaction()
    public async InitModel(ctx: Context): Promise<void> {
        const model: Model = {
            ID: 'model',
            CID: 'QmdsDpteXxFXQZSPZSjvJiC4gaC6bmjNeQQwaadqfXQ59k',
        };

        model.doctype = 'model';
        await ctx.stub.putState('model', Buffer.from(stringify(sortKeysRecursive(model))));
        console.info('Initial model added to the ledger');
    }

    // UpdateModel updates the CID of the model in the world state to the CID of the new model.
    @Transaction(true)
    public async UpdateModel(ctx: Context, cid: string): Promise<void> {
        const newModel: Model = {
            ID: 'model',
            CID: cid,
        };

        newModel.doctype = 'model';
        await ctx.stub.putState('model', Buffer.from(stringify(sortKeysRecursive(newModel))));
    }

    // GetModel returns the CID of the model currently in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetModel(ctx: Context): Promise<string> {
        const result = await ctx.stub.getState('model');
        return result.toString();
    }

}

