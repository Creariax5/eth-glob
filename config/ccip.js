// CCIP Router addresses for testnets
const ccipConfig = {
  ethereumSepolia: {
    router: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    chainSelector: "16015286601757825753",
    linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
    usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
  },
  arbitrumSepolia: {
    router: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165", 
    chainSelector: "3478487238524512106",
    linkToken: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
    usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
  },
  baseSepolia: {
    router: "0xD3b06cEbF099CE7DA4AcCf578aaeFe5238Cd4CC8",
    chainSelector: "10344971235874465080", 
    linkToken: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
  }
};

module.exports = ccipConfig;