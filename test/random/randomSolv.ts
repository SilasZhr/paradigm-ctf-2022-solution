import { ethers } from "hardhat";
import { expect } from "chai";

describe("[Challenge] Random", function () {
    let deployer, attacker;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const SetupFactory = await ethers.getContractFactory(
            "SetupRandom",
            deployer
        );
        this.challenge = await SetupFactory.deploy();

        expect(await this.challenge.isSolved()).to.equal(false);
    });

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        const RandomFactory = await ethers.getContractFactory(
            "Random",
            attacker
        );
        const mcHelperAddress = await this.challenge.mcHelper();
        const Random = RandomFactory.attach(mcHelperAddress);
        await Random.solve(4);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(await this.challenge.isSolved()).to.equal(true);
    });
});
