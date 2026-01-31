const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment...");
    
    // Get the deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    
    // Deploy the token contract
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy();
    
    console.log("Token address:", token.target);
    
    // Wait for deployment to be mined
    await token.waitForDeployment();
    console.log("Token deployed to:", token.target);
    
    // Wait a bit for the network to process the deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the contract code
    const code = await hre.ethers.provider.getCode(token.target);
    if (code === '0x') {
      throw new Error("Contract deployment failed - no code at address");
    }
    
    console.log("Contract code verified successfully");
    console.log("Please update the token address in frontend/app.js to:", token.target);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 