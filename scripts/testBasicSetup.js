const hre = require("hardhat");

async function main() {
  console.log("Testing basic Hardhat and Chainlink setup...");
  
  // Test compilation
  try {
    await hre.run("compile");
    console.log("✅ Hardhat compilation successful");
  } catch (error) {
    console.error("❌ Compilation failed:", error.message);
    return;
  }

  // Test if we can get signers
  try {
    const [signer] = await hre.ethers.getSigners();
    console.log("✅ Signer available:", signer.address);
  } catch (error) {
    console.error("❌ Signer failed:", error.message);
    return;
  }

  console.log("🎯 Basic setup verification complete!");
  console.log("Ready to test with actual network...");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
