const { ethers } = require("hardhat")
const { expect } = require("chai")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}

const ether = tokens

describe("RealEstate", () => {
    let realEstate, escrow
    let deployer, seller, buyer
    let nftId = 1
    let purchasePrice = ether(100)
    let escrowAmount = ether(20)

    beforeEach(async () => {
        // Setup accounts
        accounts = await ethers.getSigners()
        deployer = await accounts[0]
        seller = deployer
        buyer = accounts[1]
        inspector = accounts[2]
        lender = accounts[3]

        // Load contracts
        const RealEstate = await ethers.getContractFactory("RealEstate")
        const Escrow = await ethers.getContractFactory("Escrow")

        // Deploy contracts
        realEstate = await RealEstate.deploy()
        escrow = await Escrow.deploy(
            realEstate.address,
            nftId,
            purchasePrice,
            escrowAmount,
            buyer.address,
            seller.address,
            inspector.address,
            lender.address
        )

        transaction = await realEstate
            .connect(seller)
            .approve(escrow.address, nftId)
        await transaction.wait()
    })

    describe("Deployments", async () => {
        it("sends an NFT to the seller / deployer", async () => {
            expect(await realEstate.ownerOf(nftId)).to.equal(seller.address)
        })
    })

    describe("Selling real estate", async () => {
        let transaction, balance

        it("executes a successful transaction", async () => {
            // Expects the seller to be NFT owner before the sell
            expect(await realEstate.ownerOf(nftId)).to.equal(seller.address)

            // Check escrow balance
            balance = await escrow.getBalance()
            console.log("Escrow balance:", ethers.utils.formatEther(balance))

            // Buyer deposit earnest
            transaction = await escrow
                .connect(buyer)
                .depositEarnest({ value: ether(20) })
            await transaction.wait()
            console.log("Buyer deposits earnest money")

            // Check escrow balance
            balance = await escrow.getBalance()
            console.log("Escrow balance:", ethers.utils.formatEther(balance))

            // Inspector updates status
            transaction = await escrow
                .connect(inspector)
                .updateInspectionStatus(true)
            console.log("Inspector updates status")

            // Buyer approves sale
            transaction = await escrow.connect(buyer).approveSale()
            await transaction.wait()
            console.log("Buyer approves the sale")

            // Seller approves sale
            tranasction = await escrow.connect(seller).approveSale()
            await transaction.wait()
            console.log("Seller approves the sale")

            // Lender funds sale
            transaction = await lender.sendTransaction({
                to: escrow.address,
                value: ether(80),
            })

            // Lender approves sale
            tranasction = await escrow.connect(lender).approveSale()
            await transaction.wait()
            console.log("Lender approves the sale")

            // Finalize sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait()
            console.log("Buyer finalizes sale!")

            // Expects the buyer to be NFT owner after the sell
            expect(await realEstate.ownerOf(nftId)).to.equal(buyer.address)

            // Expect seller to receive funds
            balance = await ethers.provider.getBalance(seller.address)
            console.log("Seller balance: ", ethers.utils.formatEther(balance))
            expect(balance).to.be.above(ether(10099))

            // Cancel sale
            // transaction = await escrow
            //     .connect(inspector)
            //     .updateInspectionStatus(false)
        })
    })
})
