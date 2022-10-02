import { ethers, deployments, network, run } from "hardhat";
import { Ballot } from "../typechain-types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../hardhat-helper-config";
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../verify";

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
  const waitBlockConfirmation = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS

  ballot = await deploy("Ballot", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: waitBlockConfirmation
  });

  // Verify the deployment
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying......")
    await verify(ballot.address, args)
  }
}

export default deployBallot
deployBallot.tags = ["ballot"]








