import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Ballot } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let deployer: SignerWithAddress;
  let chairperson: string;
  let anotherAddress: SignerWithAddress;
  let thirdAddress: SignerWithAddress;
  let attacker: SignerWithAddress;
  let voterFive: SignerWithAddress; 


  beforeEach(async function () {
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    );
    await ballotContract.deployed();
    [deployer, anotherAddress, thirdAddress, attacker, voterFive] = await ethers.getSigners();
    chairperson = await ballotContract.chairperson();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
        for (let index = 0; index < PROPOSALS.length; index++) {
            const proposal = await ballotContract.proposals(index);
            expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
              PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
        for (let index = 0; index < PROPOSALS.length; index++) {
            const proposal = await ballotContract.proposals(index);
            expect(proposal.voteCount.toNumber()).to.eq(0)
          }
    });
    it("sets the deployer address as chairperson", async function () {
        expect (deployer.address).to.eq(chairperson)
        });
    it("sets the voting weight for the chairperson as 1", async function () {
        let voter = await ballotContract.voters(chairperson)
        expect(voter.weight.toNumber()).to.eq(1)
        });
  });

   describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
     it("gives right to vote for another address", async function () {
        expect(await ballotContract.giveRightToVote(anotherAddress.address)).to.be.ok
     });
    it("can not give right to vote for someone that has voted", async function () {
        await ballotContract.giveRightToVote(anotherAddress.address);
        await ballotContract.connect(anotherAddress).vote(1);
        await expect(ballotContract.giveRightToVote(anotherAddress.address)).to.be.revertedWith("The voter already voted.");
    });
    it("can not give right to vote for someone that has already voting rights", async function () {
        await ballotContract.giveRightToVote(anotherAddress.address);
        let voter = await ballotContract.voters(anotherAddress.address);
        expect(voter.weight.toNumber()).to.eq(1);
        await expect(ballotContract.giveRightToVote(anotherAddress.address)).to.be.reverted
     });
   });

   describe("when the voter interact with the vote function in the contract", function () {    
    it("should register the vote", async () => {
        await ballotContract.giveRightToVote(anotherAddress.address);
        let voter = await ballotContract.voters(anotherAddress.address);
        expect(voter.weight.toNumber()).to.eq(1);
        await ballotContract.connect(anotherAddress).vote(1);
        let proposal = await ballotContract.proposals(1);
        expect(proposal.voteCount.toNumber()).to.eq(1);
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    it("should transfer voting power", async () => {
        await ballotContract.giveRightToVote(anotherAddress.address);
        await ballotContract.giveRightToVote(thirdAddress.address);
        let voter1 = await ballotContract.voters(anotherAddress.address);
        expect(voter1.weight.toNumber()).to.eq(1);
        expect(voter1.voted).to.eq(false);
        await ballotContract.connect(anotherAddress).delegate(thirdAddress.address);
        let delegatedVoter = await ballotContract.voters(thirdAddress.address);
        expect(delegatedVoter.weight.toNumber()).to.eq(2);
        expect(delegatedVoter.voted).to.eq(false);
    });
  });

  describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
    it("should revert", async () => {
        await expect(ballotContract.connect(attacker).giveRightToVote(thirdAddress.address)).to.be.revertedWith('Only chairperson can give right to vote.');
    });
  });

  describe("when the an attacker interact with the vote function in the contract", function () {
    it("should revert", async () => {
        await expect(ballotContract.connect(attacker).vote(1)).to.be.revertedWith('Has no right to vote');
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    it("should revert", async () => {
        await expect(ballotContract.connect(attacker).delegate(thirdAddress.address)).to.be.revertedWith('You have no right to vote');
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    it("should return 0", async () => {
        expect(await ballotContract.winningProposal()).to.eq(0);
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    it("should return 0", async () => {
        await ballotContract.vote(0);
        let proposal = await ballotContract.proposals(0);
        expect(await ballotContract.winningProposal()).to.eq(0);
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    it("should return name of proposal 0", async () => {
        let proposal = await ballotContract.proposals(0);
        expect(await ballotContract.winnerName()).to.eq(proposal.name);
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    it("should return name of proposal 0", async () => {
        await ballotContract.vote(0);
        let proposal = await ballotContract.proposals(0);
        expect(proposal.voteCount.toString()).to.eq("1");
        expect(await ballotContract.winnerName()).to.eq(proposal.name);
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    it("should return the name of the winner proposal", async () => {
        await ballotContract.giveRightToVote(anotherAddress.address);
        await ballotContract.giveRightToVote(thirdAddress.address);
        await ballotContract.giveRightToVote(attacker.address);
        await ballotContract.giveRightToVote(voterFive.address);
        
        await ballotContract.vote(0);
        await ballotContract.connect(anotherAddress).vote(0);
        await ballotContract.connect(thirdAddress).vote(0);
        await ballotContract.connect(attacker).vote(0);
        await ballotContract.connect(voterFive).vote(0);

        let proposal = await ballotContract.proposals(0);
        expect(proposal.voteCount.toString()).to.eq("5");
        expect(await ballotContract.winnerName()).to.eq(proposal.name);
    });
  });
 });



