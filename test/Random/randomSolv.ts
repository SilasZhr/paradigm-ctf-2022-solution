import {ethers} from 'hardhat';
import {expect} from 'chai';

describe('[Challenge] Random', function () {

    let deployer, attacker;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const SetupFactory = await ethers.getContractFactory('Setup', deployer);
        this.challenge = await SetupFactory.deploy();

        expect(
            await this.challenge.isSolved()
        ).to.equal(false);
    });

    it('Exploit', async function () {
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