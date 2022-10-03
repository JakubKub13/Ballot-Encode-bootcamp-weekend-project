import { ethers, getNamedAccounts } from "hardhat";
import { Ballot } from "../typechain-types";


async function main() {
    let BallotGoerli: Ballot
    const { deployer } = await getNamedAccounts();
    BallotGoerli = await ethers.getContractAt("Ballot", "0x20CA848E5460D7564c482A2D24c97B85aaff5960", deployer)
    console.log(await BallotGoerli.chairperson())

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })