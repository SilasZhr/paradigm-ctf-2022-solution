import { ethers } from "hardhat";
import { expect } from "chai";

describe("[Challenge] SourceCode", function () {
    let deployer, attacker;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const SetupFactory = await ethers.getContractFactory(
            "SetupSourceCode",
            deployer
        );
        this.challenge = await SetupFactory.deploy();

        expect(await this.challenge.isSolved()).to.equal(false);
    });

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        const ChallengeFactory = await ethers.getContractFactory(
            "Challenge",
            attacker
        );
        const ChallengeAddress = await this.challenge.challenge();
        const Challenge = ChallengeFactory.attach(ChallengeAddress);
        const code =
            "0x7f80607f60005360015260215260416000f300000000000000000000000000000080607f60005360015260215260416000f3000000000000000000000000000000";
        await Challenge.solve(code);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(await this.challenge.isSolved()).to.equal(true);
    });
});
