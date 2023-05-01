/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify().
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { Model } from './model';
import { TextDecoder } from 'util';

const utf8Decoder = new TextDecoder();

@Info({ title: 'LocalModelAdd', description: 'Smart contract for adding updated local models' })
export class LocalModelAddContract extends Contract {

    @Transaction(true)
    public async InitLocalModels(ctx: Context): Promise<void> {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(0, 0);
        await ctx.stub.putState('localModelCount', buffer);
    }

    // GetLocalModelCount returns the number of local models currently in the world state.
    @Transaction(false)
    public async GetLocalModelCount(ctx: Context): Promise<number> {
        const bytes = await ctx.stub.getState('localModelCount');
        const buffer = Buffer.from(bytes);
        return buffer.readInt32BE(0);
    }

    // AddLocalModel adds the CID of a local model to the world state.
    @Transaction(true)
    public async AddLocalModel(ctx: Context, prevCID: string, CID: string): Promise<void> {
        const count = await this.GetLocalModelCount(ctx);
        const ID = `localmodel${this.padNumber(count)}`;

        const localModel: Model = {
            ID: ID,
            prevCID: prevCID,
            CID: CID,
        };

        localModel.doctype = 'model';
        await ctx.stub.putState(localModel.ID, Buffer.from(stringify(sortKeysRecursive(localModel))));
        console.info(`Local Model ${localModel.ID} added`);

        // Increment the local model count.
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(count + 1, 0);

        await ctx.stub.putState('localModelCount', buffer);
    }

    // GetLocalModels returns all local models currently present in the world state.
    @Transaction(false)
    public async GetLocalModels(ctx: Context): Promise<Model[]> {
        const count = await this.GetLocalModelCount(ctx);

        const localModels: Model[] = [];

        const iterator = await ctx.stub.getStateByRange(`localmodel${this.padNumber(0)}`, `localmodel${this.padNumber(count)}`);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let localModel: Model = JSON.parse(strValue);
            localModels.push(localModel);
            result = await iterator.next();
        }

        return localModels;
    }

    // PopLocalModels deletes all local models currently present in the world state and returns them.
    @Transaction(true)
    public async PopLocalModels(ctx: Context): Promise<Model[]> {
        const localModels: Model[] = await this.GetLocalModels(ctx);

        for (const localModel of localModels) {
            await ctx.stub.deleteState(localModel.ID);
        }

        // Reset the local model count.
        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(0, 0);

        await ctx.stub.putState('localModelCount', buffer);

        // Return the list of local models.
        return localModels;
    }

    private padNumber(num: number): string {
        return num.toString().padStart(10, '0');
    }
}
