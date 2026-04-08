// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {inco, e, ebool, euint256} from "@inco/lightning/src/Lib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialERC20 is Ownable {
    error InsufficientFees();

    event Transfer(address indexed from, address indexed to, euint256 amount);
    event Approval(address indexed owner, address indexed spender, euint256 amount);
    event Mint(address indexed to, uint256 amount);
    event EncryptedMint(address indexed to, euint256 amount);

    euint256 public totalSupply;
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    mapping(address => euint256) internal balances;
    mapping(address => mapping(address => euint256)) internal allowances;

    constructor() Ownable(msg.sender) {
        name = "Confidential USD";
        symbol = "cUSD";
    }

    function _requireFee() internal view {
        if (msg.value < inco.getFee()) revert InsufficientFees();
    }

    function mint(uint256 mintAmount) public virtual onlyOwner {
        euint256 amount = e.asEuint256(mintAmount);
        balances[owner()] = e.add(balances[owner()], amount);
        e.allow(balances[owner()], address(this));
        e.allow(balances[owner()], owner());
        totalSupply = e.add(totalSupply, amount);
        e.reveal(totalSupply);
        emit Mint(owner(), mintAmount);
    }

    function encryptedMint(bytes calldata encryptedAmount) public payable virtual {
        _requireFee();
        euint256 amount = e.newEuint256(encryptedAmount, msg.sender);
        e.allow(amount, address(this));
        if (euint256.unwrap(balances[msg.sender]) == bytes32(0)) {
            balances[msg.sender] = amount;
        } else {
            balances[msg.sender] = e.add(balances[msg.sender], amount);
        }
        e.allow(balances[msg.sender], address(this));
        e.allow(balances[msg.sender], owner());
        e.allow(balances[msg.sender], msg.sender);
        totalSupply = e.add(totalSupply, amount);
        e.reveal(totalSupply);
        emit EncryptedMint(msg.sender, amount);
    }

    function transfer(address to, bytes calldata encryptedAmount) public payable virtual returns (bool) {
        _requireFee();
        return transfer(to, e.newEuint256(encryptedAmount, msg.sender));
    }

    function transfer(address to, euint256 amount) public virtual returns (bool) {
        e.allow(amount, address(this));
        ebool canTransfer = e.ge(balances[msg.sender], amount);
        _transfer(msg.sender, to, amount, canTransfer);
        return true;
    }

    function balanceOf(address wallet) public view virtual returns (euint256) {
        return balances[wallet];
    }

    function approve(address spender, bytes calldata encryptedAmount) public payable virtual returns (bool) {
        _requireFee();
        return approve(spender, e.newEuint256(encryptedAmount, msg.sender));
    }

    function approve(address spender, euint256 amount) public virtual returns (bool) {
        allowances[msg.sender][spender] = amount;
        e.allow(amount, address(this));
        e.allow(amount, msg.sender);
        e.allow(amount, spender);
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual returns (euint256) {
        return allowances[owner][spender];
    }

    function transferFrom(address from, address to, bytes calldata encryptedAmount) public payable virtual returns (bool) {
        _requireFee();
        return transferFrom(from, to, e.newEuint256(encryptedAmount, msg.sender));
    }

    function transferFrom(address from, address to, euint256 amount) public virtual returns (bool) {
        e.allow(amount, address(this));
        euint256 currentAllowance = allowances[from][msg.sender];
        ebool allowedTransfer = e.ge(currentAllowance, amount);
        ebool canTransfer = e.ge(balances[from], amount);
        ebool isTransferable = e.and(canTransfer, allowedTransfer);
        euint256 transferValue = e.select(isTransferable, amount, e.asEuint256(0));
        if (euint256.unwrap(transferValue) != bytes32(0)) {
            allowances[from][msg.sender] = e.sub(currentAllowance, transferValue);
            e.allow(allowances[from][msg.sender], address(this));
            e.allow(allowances[from][msg.sender], from);
            e.allow(allowances[from][msg.sender], msg.sender);
        }
        _transfer(from, to, transferValue, isTransferable);
        return true;
    }

    function _transfer(address from, address to, euint256 amount, ebool isTransferable) internal virtual {
        euint256 transferValue = e.select(isTransferable, amount, e.asEuint256(0));
        if (euint256.unwrap(balances[to]) == bytes32(0)) {
            balances[to] = transferValue;
        } else {
            balances[to] = e.add(balances[to], transferValue);
        }
        e.allow(balances[to], address(this));
        e.allow(balances[to], to);
        balances[from] = e.sub(balances[from], transferValue);
        e.allow(balances[from], address(this));
        e.allow(balances[from], from);
        emit Transfer(from, to, transferValue);
    }
}
