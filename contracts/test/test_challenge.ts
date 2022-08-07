import { expect } from "chai";
import { ethers } from "hardhat";

describe("Challenger", function () {
  it("Should deploy challenge", async function () {
    const [addr1, addr2] = await ethers.getSigners();

    const Challenge = await ethers.getContractFactory("Challenge");
    const challenge = await Challenge.deploy(
      await addr1.getAddress(),
      await addr2.getAddress(),
      "somedesc"
    );
    await challenge.deployed();
  });
});
