import { ethers, getNamedAccounts } from "hardhat";
import { Ballot } from "../typechain-types";


async function giveRightToVote() {
    let BallotGoerli: Ballot
    const JacobAddr: string = "0x7D3d4D7ADB5720e4A1574d7BACb0affB962eb9C5"
    const MartinAddr: string = "0x0148756feD750C4Ba9232297a88B6b82690223ad"
    const IvorAddr: string = "0x90b28A6bB55f48496f89De8B3FE8b830832ca43f"
    
    const { deployer } = await getNamedAccounts()
    //const { deployer, account1, account2 } = await getNamedAccounts();
    BallotGoerli = await ethers.getContractAt("Ballot", "0x20CA848E5460D7564c482A2D24c97B85aaff5960", deployer)
    
    // giveRightToVote from deployer / chairperson to account1
    const txResponse = await BallotGoerli.giveRightToVote(IvorAddr);
    console.log(txResponse)
}

giveRightToVote();

module.exports = { giveRightToVote }

    