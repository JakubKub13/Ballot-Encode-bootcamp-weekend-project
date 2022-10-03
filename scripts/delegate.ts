import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, getNamedAccounts } from "hardhat";
import { Ballot } from "../typechain-types";


async function delegate() {
    let BallotGoerli: Ballot
    let Jacob: SignerWithAddress 
    let Martin: SignerWithAddress

    Jacob = await ethers.getSigner("0x7D3d4D7ADB5720e4A1574d7BACb0affB962eb9C5")
    Martin = await ethers.getSigner("0x0148756feD750C4Ba9232297a88B6b82690223ad")

    BallotGoerli = await ethers.getContractAt("Ballot", "0x20CA848E5460D7564c482A2D24c97B85aaff5960", Jacob)
    const txResponse = await BallotGoerli.delegate(Martin.address)
    console.log(txResponse)
   
}

delegate()

module.exports = { delegate }

