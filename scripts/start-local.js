const hre = require("hardhat");

async function main() {
  const [deployer, ...accounts] = await hre.ethers.getSigners();
  
  console.log("Local network started!");
  console.log("\nAvailable accounts:");
  console.log("==================");
  
  for (let i = 0; i < accounts.length; i++) {
    const balance = await hre.ethers.provider.getBalance(accounts[i].address);
    console.log(`Account ${i}: ${accounts[i].address}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  }
  
  console.log("Deployer account:", deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 