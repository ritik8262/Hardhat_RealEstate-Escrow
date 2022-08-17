const { ethers } = require("hardhat")
const {
    TASK_COMPILE_SOLIDITY_RUN_SOLC,
} = require("hardhat/builtin-tasks/task-names")
const { EDIT_DISTANCE_THRESHOLD } = require("hardhat/internal/constants")

const main = async () => {
    const nftId = 1
    const accounts = await ethers.getSigners()
    const buyer = accounts[0]
    const seller = accounts[1]
    const inspector = accounts[2]
    const lender = accounts[3]
    const purchasePrice = ethers.utils.parseEther("100")
    const escrowAmount = ethers.utils.parseEther("5")

    const realEstateContract = await ethers.getContractFactory("RealEstate")
    const realEstate = await realEstateContract.deploy()
    await realEstate.deployed()
    console.log("Real Estate contract deployed to : ", realEstate.address)

    const escrowContract = await ethers.getContractFactory("Escrow")
    const escrow = await escrowContract.deploy(
        realEstate.address,
        nftId,
        purchasePrice,
        escrowAmount,
        buyer.address,
        seller.address,
        inspector.address,
        lender.address
    )
    await escrow.deployed()
    console.log("Escrow contract deployed to : ", escrow.address)

    // Deposit earnest
    const deposit = await escrow.depositEarnest({
        value: ethers.utils.parseEther("100"),
    })
    console.log("Amount Deposited ")

    // Get contract balance
    const contractBalance = await escrow.getBalance()
    console.log("contractBalance: ", ethers.utils.formatEther(contractBalance))

    // Update inspection status
    const inspection_status = await escrow
        .connect(inspector)
        .updateInspectionStatus(true)

    // Apporval
    const buyerApprove = await escrow.connect(buyer).approveSale()
    const sellerApprove = await escrow.connect(seller).approveSale()
    const lenderApprove = await escrow.connect(lender).approveSale()
}

const runMain = async () => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

runMain()
