// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {UniswapV2Factory} from "./UniswapV2Factory.sol";
import {UniswapV2Pair} from "./UniswapV2Pair.sol";

contract MockUniswapV2Router {
    address public factory;
    uint256 public price; // DAI/WETH price for mock purposes

    constructor(address _factory) {
        factory = _factory;
    }

    function addLiquidity(address tokenA, address tokenB) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        address pair = UniswapV2Factory(factory).getPair(tokenA, tokenB);
        require(pair != address(0), "Pair does not exist");

        // Pull approved tokens (hardcoded amounts for simplicity)
        amountA = 1200000 * 1e18; // DAI
        amountB = 1000 * 1e18;    // WETH
        if (tokenA == UniswapV2Pair(pair).token0()) {
            require(IERC20(tokenA).transferFrom(msg.sender, pair, amountA), "Transfer A failed");
            require(IERC20(tokenB).transferFrom(msg.sender, pair, amountB), "Transfer B failed");
        } else {
            require(IERC20(tokenA).transferFrom(msg.sender, pair, amountB), "Transfer A failed");
            require(IERC20(tokenB).transferFrom(msg.sender, pair, amountA), "Transfer B failed");
            (amountA, amountB) = (amountB, amountA);
        }

        liquidity = 1e18; // Mock liquidity tokens
        UniswapV2Pair(pair).mint(msg.sender, liquidity);
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts) {
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = amountIn * price / 1e18;
    }
}