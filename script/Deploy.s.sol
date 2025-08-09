// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/MockToken.sol";
import "../src/UniswapV2Factory.sol";
import "../src/MockUniswapV2Router.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy tokens
        MockToken weth = new MockToken("Wrapped Ether", "WETH");
        MockToken dai = new MockToken("Dai Stablecoin", "DAI");

        // Deploy factories
        UniswapV2Factory uniswapFactory = new UniswapV2Factory();
        UniswapV2Factory sushiswapFactory = new UniswapV2Factory();

        // Deploy routers
        MockUniswapV2Router uniswapRouter = new MockUniswapV2Router(address(uniswapFactory));
        MockUniswapV2Router sushiswapRouter = new MockUniswapV2Router(address(sushiswapFactory));

        // Create pairs
        address uniswapPair = uniswapFactory.createPair(address(dai), address(weth));
        address sushiswapPair = sushiswapFactory.createPair(address(dai), address(weth));

        vm.stopBroadcast();

        // Log addresses
        console.log("WETH:", address(weth));
        console.log("DAI:", address(dai));
        console.log("Uniswap Router:", address(uniswapRouter));
        console.log("Sushiswap Router:", address(sushiswapRouter));
        console.log("Uniswap Pair:", uniswapPair);
        console.log("Sushiswap Pair:", sushiswapPair);
    }
}