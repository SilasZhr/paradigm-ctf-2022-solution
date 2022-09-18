import { extractLinkReferences } from '@openzeppelin/upgrades-core';
import { parseTransaction } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { boolean } from 'hardhat/internal/core/params/argumentTypes';
import {merkleRoot, tokenTotal, claims} from  '../../contracts/merkledrop/tree.json';
import { BigNumber, utils} from 'ethers';
import { promise } from 'sinon';


const amountLenth = 24;
let result = [];

export async function findNode() {
    
    let node = [];
    let knownAmounts = [];
    for (let leaf in claims) {
        knownAmounts.push(BigNumber.from(claims[leaf]['amount']))
        let proof: string[] = claims[leaf]['proof'];
        proof = proof.slice(0);
        for (let count in proof){
            let entry = proof[count]
            if (await validAmount(entry)){
                if ( !node.includes(entry) ){
                    node.push(entry);
                }
            }
        }
    }
    let amounts = [];
    for (let count in node) {
        let entry = node[count];
        amounts.push(entry.substr(-amountLenth));
    }
    amounts = amounts.map(x => BigNumber.from('0x'+x));
    amounts = amounts.concat(knownAmounts.map(x => BigNumber.from(x)));
    amounts = amounts.sort(compareFn).reverse();
    //console.log(BigNumber.from(tokenTotal).sub(amounts[0]) );
    result = await dynamicSearch(BigNumber.from(tokenTotal).sub(amounts[0]), amounts.slice(1));

    console.log(node);
    return node;

}

async function dynamicSearch(total: BigNumber, amounts: BigNumber[]): Promise<BigNumber[]>{
    let tmp: BigNumber[] = [];
    if (amounts.length === 0){
        return [];
    }
    for (let count in amounts){
        let amount = amounts[count];
        if (amount.gt(total)){
            continue;
        }
        else if (total.eq(amount)) {
            tmp.push(amount);
            return tmp
        }
        else if (amounts.length === 1 && !total.eq(amount)) {
            return [];
        }
        else {
            tmp.push(amount);
            let res = dynamicSearch(total.sub(amount), amounts.slice(1));
            if (res === []){
                tmp = tmp.slice(-1);
                continue
            }
            else {
                return tmp.concat(res);
            }
        }

    }

}


async function validAmount(entry: string): Promise<boolean>{
    let tmp = entry.substr(-amountLenth);
    return !BigNumber.from('0x' + tmp).gt(BigNumber.from(tokenTotal));
}

function compareFn(a: BigNumber , b: BigNumber){
    return a.gte(b)? 1 : -1;
}

export function getResult(){
    return result;
}


