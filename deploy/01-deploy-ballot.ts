import { ethers, deployments, network, run } from "hardhat";
import { Ballot } from "../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}
const args: any[] = [convertStringArrayToBytes32(PROPOSALS)]

const deployBallot: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let ballot: Ballot;
  ballot = await deploy("Ballot", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: 1
  });
 }

export default deployBallot
deployBallot.tags = ["ballot"]








