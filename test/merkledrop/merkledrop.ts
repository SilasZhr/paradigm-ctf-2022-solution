import {ethers} from 'hardhat';
import {expect} from 'chai';
import {findNode, getResult } from './helper';
import { BigNumber } from 'ethers';

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
        results = results.map(x => x.toString())
        const RandomFactory = await ethers.getContractFactory('Random', attacker);
        const RandomAddress = (await this.challenge.random());
        const Random = RandomFactory.attach(RandomAddress);
        await Random.solve(4);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(
            await this.challenge.isSolved()
        ).to.equal(true);
        
    });
});