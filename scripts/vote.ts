import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, getNamedAccounts } from "hardhat";
import { Ballot } from "../typechain-types";


async function vote() {
    let BallotGoerli: Ballot
    let Martin: SignerWithAddress

    Martin = await ethers.getSigner("0x0148756feD750C4Ba9232297a88B6b82690223ad")

    BallotGoerli = await ethers.getContractAt("Ballot", "0x20CA848E5460D7564c482A2D24c97B85aaff5960", Martin)
    const txResponse = await BallotGoerli.vote(0)
    console.log(txResponse)
   
}

vote()

module.exports = { vote }