// SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftId;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable buyer;
    address payable seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function!");
        _;
    }

    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "Only inspector can call this function"
        );
        _;
    }

    bool public inspectionPassed = false;

    mapping(address => bool) public approval;

    receive() external payable {}

    constructor(
        address _nftAddress,
        uint256 _nftId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _buyer,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftId = _nftId;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        buyer = _buyer;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function depositEarnest() public payable onlyBuyer {
        require(msg.value >= escrowAmount, "Minimum escrow Amount is 20");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspectionPassed = _passed;
    }

    function approveSale() public {
        approval[msg.sender] = true;
    }

    // function cancelSale() public {
    //     if (inspectionPassed == false) {
    //         payable(buyer).transfer(address(this).balance);
    //     } else {
    //         payable(seller).transfer(address(this).balance);
    //     }
    // }

    function finalizeSale() public {
        require(inspectionPassed, "Must pass inspection");

        require(approval[buyer], "Must be apporved by buyer");
        require(approval[seller], "Must be apporved by seller");
        require(approval[lender], "Must be apporved by lender");
        require(
            address(this).balance == purchasePrice,
            "Must have enough ether funds."
        );

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        // Transfer the ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}
