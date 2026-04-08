// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {inco, e, ebool, euint256} from "@inco/lightning/src/Lib.sol";
import {DecryptionAttestation} from "@inco/lightning/src/lightning-parts/DecryptionAttester.types.sol";
import {asBool} from "@inco/lightning/src/shared/TypeUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IConfidentialERC20 {
    function transfer(address to, euint256 amount) external returns (bool);
    function transferFrom(address from, address to, euint256 amount) external returns (bool);
    function balanceOf(address wallet) external view returns (euint256);
}

contract ConfidentialLending is Ownable {
    error InsufficientFees();
    error InvalidAttestation();
    error NotLiquidatable();

    event Deposit(address indexed user, euint256 amount);
    event Withdraw(address indexed user, euint256 amount);
    event Borrow(address indexed user, euint256 amount);
    event Repay(address indexed user, euint256 amount);
    event Liquidate(address indexed user, address indexed liquidator, euint256 collateralSeized, euint256 debtRepaid);
    event LiquidationCheckRequested(address indexed user, address indexed requester, ebool isUnhealthy);

    IConfidentialERC20 public immutable token;

    uint256 public constant LIQUIDATION_FACTOR_NUM = 11e17;   // 1.1 in 18 decimals
    uint256 public constant LIQUIDATION_FACTOR_DEN = 1e18;
    uint256 public constant COLLATERAL_FACTOR_NUM = 15e17;    // 1.5 in 18 decimals
    uint256 public constant COLLATERAL_FACTOR_DEN = 1e18;
    uint256 public constant INTEREST_RATE_PER_SECOND = 1e15;

    mapping(address => euint256) public collateral;
    mapping(address => euint256) public debt;
    mapping(address => uint256) public lastUpdateTime;

    constructor(address _token) Ownable(msg.sender) {
        token = IConfidentialERC20(_token);
    }

    function _requireFee(uint256 ciphertextCount) internal view {
        if (msg.value < inco.getFee() * ciphertextCount) revert InsufficientFees();
    }

    function _accrueInterest(address user) internal {
        uint256 prev = lastUpdateTime[user];
        if (prev == 0) {
            lastUpdateTime[user] = block.timestamp;
            return;
        }
        uint256 elapsed = block.timestamp - prev;
        if (elapsed == 0) return;
        lastUpdateTime[user] = block.timestamp;
        uint256 factor = 1e18 + (INTEREST_RATE_PER_SECOND * elapsed);
        debt[user] = e.mul(debt[user], factor);
        e.allowThis(debt[user]);
        e.allow(debt[user], user);
    }

    function deposit(bytes calldata encryptedAmount) external payable {
        _requireFee(1);
        euint256 amount = e.newEuint256(encryptedAmount, msg.sender);
        e.allow(amount, address(this));
        _accrueInterest(msg.sender);
        if (euint256.unwrap(collateral[msg.sender]) == bytes32(0)) {
            collateral[msg.sender] = amount;
        } else {
            collateral[msg.sender] = e.add(collateral[msg.sender], amount);
        }
        e.allowThis(collateral[msg.sender]);
        e.allow(collateral[msg.sender], msg.sender);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Deposit(msg.sender, amount);
    }

    function borrow(bytes calldata encryptedAmount) external payable {
        _requireFee(1);
        euint256 amount = e.newEuint256(encryptedAmount, msg.sender);
        e.allow(amount, address(this));
        _accrueInterest(msg.sender);
        euint256 newDebt = e.add(debt[msg.sender], amount);
        euint256 minCollateral = e.div(e.mul(newDebt, COLLATERAL_FACTOR_NUM), COLLATERAL_FACTOR_DEN);
        ebool canBorrow = e.ge(collateral[msg.sender], minCollateral);
        euint256 actualBorrow = e.select(canBorrow, amount, e.asEuint256(0));
        debt[msg.sender] = e.select(canBorrow, newDebt, debt[msg.sender]);
        e.allowThis(debt[msg.sender]);
        e.allow(debt[msg.sender], msg.sender);
        e.allow(actualBorrow, address(this));
        require(token.transfer(msg.sender, actualBorrow), "Transfer failed");
        emit Borrow(msg.sender, actualBorrow);
    }

    function repay(bytes calldata encryptedAmount) external payable {
        _requireFee(1);
        euint256 amount = e.newEuint256(encryptedAmount, msg.sender);
        e.allow(amount, address(this));
        _accrueInterest(msg.sender);
        euint256 actualRepay = e.min(amount, debt[msg.sender]);
        debt[msg.sender] = e.sub(debt[msg.sender], actualRepay);
        e.allowThis(debt[msg.sender]);
        e.allow(debt[msg.sender], msg.sender);
        e.allow(actualRepay, address(this));
        require(token.transferFrom(msg.sender, address(this), actualRepay), "Transfer failed");
        emit Repay(msg.sender, actualRepay);
    }

    function withdraw(bytes calldata encryptedAmount) external payable {
        _requireFee(1);
        euint256 amount = e.newEuint256(encryptedAmount, msg.sender);
        e.allow(amount, address(this));
        _accrueInterest(msg.sender);
        euint256 minCollateral = e.div(e.mul(debt[msg.sender], COLLATERAL_FACTOR_NUM), COLLATERAL_FACTOR_DEN);
        euint256 newCollateral = e.sub(collateral[msg.sender], amount);
        ebool safeWithdraw = e.ge(newCollateral, minCollateral);
        euint256 actualWithdraw = e.select(safeWithdraw, amount, e.asEuint256(0));
        collateral[msg.sender] = e.sub(collateral[msg.sender], actualWithdraw);
        e.allowThis(collateral[msg.sender]);
        e.allow(collateral[msg.sender], msg.sender);
        e.allow(actualWithdraw, address(this));
        require(token.transfer(msg.sender, actualWithdraw), "Transfer failed");
        emit Withdraw(msg.sender, actualWithdraw);
    }

    function getLiquidationHandle(address user) external returns (ebool) {
        _accrueInterest(user);
        euint256 thresholdDebt = e.div(e.mul(debt[user], LIQUIDATION_FACTOR_NUM), LIQUIDATION_FACTOR_DEN);
        ebool isUnhealthy = e.lt(collateral[user], thresholdDebt);
        e.allow(isUnhealthy, msg.sender);
        e.allow(debt[user], msg.sender);
        emit LiquidationCheckRequested(user, msg.sender, isUnhealthy);
        return isUnhealthy;
    }

    function liquidate(
        address user,
        DecryptionAttestation calldata decryption,
        bytes[] calldata signatures
    ) external {
        _accrueInterest(user);
        euint256 thresholdDebt = e.div(e.mul(debt[user], LIQUIDATION_FACTOR_NUM), LIQUIDATION_FACTOR_DEN);
        ebool isUnhealthy = e.lt(collateral[user], thresholdDebt);
        require(
            inco.incoVerifier().isValidDecryptionAttestation(decryption, signatures),
            "Invalid attestation"
        );
        require(ebool.unwrap(isUnhealthy) == decryption.handle, "Handle mismatch");
        require(asBool(decryption.value) == true, "Position not liquidatable");

        euint256 debtAmount = debt[user];
        euint256 collateralAmount = collateral[user];
        e.allowThis(collateralAmount);
        e.allowThis(debtAmount);
        e.allow(debtAmount, msg.sender);
        require(token.transferFrom(msg.sender, address(this), debtAmount), "Liquidator repay failed");
        require(token.transfer(msg.sender, collateralAmount), "Collateral transfer failed");
        debt[user] = e.asEuint256(0);
        collateral[user] = e.asEuint256(0);
        e.allowThis(debt[user]);
        e.allowThis(collateral[user]);
        lastUpdateTime[user] = 0;
        emit Liquidate(user, msg.sender, collateralAmount, debtAmount);
    }

    function depositFees() external payable {}

    receive() external payable {}
}
