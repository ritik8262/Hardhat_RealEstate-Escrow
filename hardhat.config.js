require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.9",
    networks: {
        rinkeby: {
            url: process.env.RINKEBY_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
        mumbai: {
            url: process.env.POLYGON_URL,
            accounts: [process.env.PRiVATE_KEY],
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
}
