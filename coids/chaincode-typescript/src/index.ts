/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {SignatureAddContract} from './signatureAdd';
import {LocalModelAddContract} from './localModelAdd';
import {GlobalModelUpdateContract} from './globalModelUpdate';

export {SignatureAddContract} from './signatureAdd';
export {LocalModelAddContract} from './localModelAdd';
export {GlobalModelUpdateContract} from './globalModelUpdate';

export const contracts: any[] = [
    SignatureAddContract, 
    LocalModelAddContract, 
    GlobalModelUpdateContract
];

