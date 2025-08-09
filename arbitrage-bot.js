require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

function validateAddress(address, name) {
    if (!ethers.isAddress(address) || address === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Invalid ${name} address: ${address}`);
    }
    return address;
}

async function checkArbitrage() {
    const routerAbi = [
        'function price() external view returns (uint256)',
        'function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)'
    ];
    const pairAbi = [
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
    ];
    const tokenAbi = ['function balanceOf(address) external view returns (uint256)'];

    const uniswapRouter = new ethers.Contract(validateAddress(process.env.UNISWAP_ROUTER, 'UNISWAP_ROUTER'), routerAbi, provider);
    const sushiswapRouter = new ethers.Contract(validateAddress(process.env.SUSHISWAP_ROUTER, 'SUSHISWAP_ROUTER'), routerAbi, provider);
    const uniswapPair = new ethers.Contract(validateAddress(process.env.UNISWAP_PAIR, 'UNISWAP_PAIR'), pairAbi, provider);
    const sushiswapPair = new ethers.Contract(validateAddress(process.env.SUSHISWAP_PAIR, 'SUSHISWAP_PAIR'), pairAbi, provider);
    const weth = new ethers.Contract(validateAddress(process.env.TOKEN_A, 'TOKEN_A'), tokenAbi, wallet);
    const dai = new ethers.Contract(validateAddress(process.env.TOKEN_B, 'TOKEN_B'), tokenAbi, wallet);

    const log = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} - ${message}\n`;
        fs.appendFileSync('arbitrage-sepolia.log', logMessage);
        console.log(logMessage);
    };

    const uniswapPrice = await uniswapRouter.price();
    const sushiswapPrice = await sushiswapRouter.price();
    const uniswapReserves = await uniswapPair.getReserves();
    const sushiswapReserves = await sushiswapPair.getReserves();
    const wethBalance = await weth.balanceOf(wallet.address);
    const daiBalance = await dai.balanceOf(wallet.address);

    log(`Wallet WETH balance: ${ethers.formatUnits(wethBalance, 18)}`);
    log(`Wallet DAI balance: ${ethers.formatUnits(daiBalance, 18)}`);
    log(`Uniswap Pair Reserves: ${ethers.formatUnits(uniswapReserves[1], 18)} WETH, ${ethers.formatUnits(uniswapReserves[0], 18)} DAI`);
    log(`Sushiswap Pair Reserves: ${ethers.formatUnits(sushiswapReserves[1], 18)} WETH, ${ethers.formatUnits(sushiswapReserves[0], 18)} DAI`);
    log(`Uniswap: 1 WETH = ${ethers.formatUnits(uniswapPrice, 18)} DAI`);
    log(`Sushiswap: 1 WETH = ${ethers.formatUnits(sushiswapPrice, 18)} DAI`);

    if (uniswapPrice > sushiswapPrice) {
        log(`Arbitrage opportunity: Buy on Sushiswap, sell on Uniswap`);
        const amountIn = ethers.parseUnits('1', 18); // 1 WETH
        const path = [process.env.TOKEN_A, process.env.TOKEN_B]; // WETH -> DAI

        // Approve WETH for Sushiswap
        const wethContract = new ethers.Contract(process.env.TOKEN_A, ['function approve(address spender, uint256 amount) external returns (bool)'], wallet);
        const approveTx = await wethContract.approve(process.env.SUSHISWAP_ROUTER, amountIn, { gasLimit: 100000 });
        log(`Approved 1 WETH for ${process.env.SUSHISWAP_ROUTER}: ${approveTx.hash}`);
        await approveTx.wait();

        // Buy DAI on Sushiswap
        const amountsOut = await sushiswapRouter.getAmountsOut(amountIn, path);
        const buyTx = await sushiswapRouter.getAmountsOut(amountIn, path); // Mock swap
        log(`Buy trade executed: ${buyTx.hash || 'mock'}`);

        // Approve DAI for Uniswap
        const daiContract = new ethers.Contract(process.env.TOKEN_B, ['function approve(address spender, uint256 amount) external returns (bool)'], wallet);
        const daiAmount = amountsOut[1];
        const approveDaiTx = await daiContract.approve(process.env.UNISWAP_ROUTER, daiAmount, { gasLimit: 100000 });
        log(`Approved ${ethers.formatUnits(daiAmount, 18)} DAI for ${process.env.UNISWAP_ROUTER}: ${approveDaiTx.hash}`);
        await approveDaiTx.wait();

        // Sell DAI on Uniswap
        const sellTx = await uniswapRouter.getAmountsOut(daiAmount, [process.env.TOKEN_B, process.env.TOKEN_A]); // Mock swap
        log(`Sell trade executed: ${sellTx.hash || 'mock'}`);
        log(`Arbitrage completed: sushi-to-uni`);
    }
}

async function main() {
    try {
        await checkArbitrage();
    } catch (error) {
        console.error('Error in arbitrage:', error.message);
        process.exit(1);
    }
}

main();