require('dotenv').config();
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

function validateAddress(address, name) {
    if (!ethers.isAddress(address) || address === '0x0000000000000000000000000000000000000000') {
        throw new Error(`Invalid ${name} address: ${address}`);
    }
    return address;
}

async function checkBalanceAndAllowance(tokenAddress, routerAddress, tokenName) {
    const tokenAbi = [
        'function balanceOf(address) external view returns (uint256)',
        'function allowance(address owner, address spender) external view returns (uint256)'
    ];
    const tokenContract = new ethers.Contract(validateAddress(tokenAddress, 'token'), tokenAbi, provider);
    const balance = await tokenContract.balanceOf(wallet.address);
    const allowance = await tokenContract.allowance(wallet.address, routerAddress);
    console.log(`${tokenName} balance: ${ethers.formatUnits(balance, 18)}`);
    console.log(`${tokenName} allowance for ${routerAddress}: ${ethers.formatUnits(allowance, 18)}`);
    return { balance, allowance };
}

async function mintTokens(tokenAddress, amount, tokenName) {
    const tokenAbi = ['function mint(address to, uint256 amount) external'];
    const tokenContract = new ethers.Contract(validateAddress(tokenAddress, 'token'), tokenAbi, wallet);

    console.log(`Minting ${ethers.formatUnits(amount, 18)} ${tokenName} to ${wallet.address}`);
    try {
        const tx = await tokenContract.mint(wallet.address, amount, { gasLimit: 100000, gasPrice: ethers.parseUnits('50', 'gwei') });
        console.log(`Mint tx sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Minted ${tokenName}`);
    } catch (error) {
        console.error(`Error in mintTokens: ${error.message}`);
        throw error;
    }
}

async function approveTokens(tokenAddress, routerAddress, amount, tokenName) {
    const tokenAbi = ['function approve(address spender, uint256 amount) external returns (bool)'];
    const tokenContract = new ethers.Contract(validateAddress(tokenAddress, 'token'), tokenAbi, wallet);

    console.log(`Approving ${ethers.formatUnits(amount, 18)} ${tokenName} for ${routerAddress}`);
    try {
        const tx = await tokenContract.approve(routerAddress, amount, { gasLimit: 100000, gasPrice: ethers.parseUnits('50', 'gwei') });
        console.log(`Approval tx sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Approved ${tokenName} for ${routerAddress}`);
    } catch (error) {
        console.error(`Error in approveTokens: ${error.message}`);
        throw error;
    }
}

async function addLiquidity(routerAddress, tokenA, tokenB, pairAddress, isSushiswap = false) {
    const routerAbi = ['function addLiquidity(address tokenA, address tokenB) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)'];
    const pairAbi = [
        'function token0() external view returns (address)',
        'function token1() external view returns (address)',
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
    ];
    const routerContract = new ethers.Contract(validateAddress(routerAddress, 'router'), routerAbi, wallet);
    const pairContract = new ethers.Contract(validateAddress(pairAddress, 'pair'), pairAbi, provider);

    const token0 = await pairContract.token0();
    const isToken0A = token0.toLowerCase() === validateAddress(tokenA, 'tokenA').toLowerCase();
    const [orderedTokenA, orderedTokenB] = isToken0A ? [tokenA, tokenB] : [tokenB, tokenA];

    const reserves = await pairContract.getReserves();
    console.log(`Pair tokens: token0=${token0}, token1=${await pairContract.token1()}`);
    console.log(`Pair reserves: reserve0=${ethers.formatUnits(reserves[0], 18)}, reserve1=${ethers.formatUnits(reserves[1], 18)}`);
    console.log(`Adding liquidity to ${routerAddress}: DAI=${orderedTokenA}, WETH=${orderedTokenB}`);

    try {
        const tx = await routerContract.addLiquidity(
            orderedTokenA,
            orderedTokenB,
            { gasLimit: 1000000, gasPrice: ethers.parseUnits('50', 'gwei') }
        );
        console.log(`Liquidity tx sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Liquidity added to ${routerAddress}`);
    } catch (error) {
        console.error(`Error in addLiquidity: ${error.message}`);
        if (error.reason) console.error(`Revert reason: ${error.reason}`);
        if (error.data) console.error(`Revert data: ${error.data}`);
        throw error;
    }
}

async function setPrice(routerAddress, price) {
    const routerAbi = ['function setPrice(uint256 _price) external'];
    const routerContract = new ethers.Contract(validateAddress(routerAddress, 'router'), routerAbi, wallet);

    console.log(`Setting price on ${routerAddress} to ${ethers.formatUnits(price, 18)} DAI/WETH`);
    try {
        const tx = await routerContract.setPrice(price, { gasLimit: 100000, gasPrice: ethers.parseUnits('50', 'gwei') });
        console.log(`Price tx sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Price set on ${routerAddress}`);
    } catch (error) {
        console.error(`Error in setPrice: ${error.message}`);
        throw error;
    }
}

async function main() {
    try {
        const UNISWAP_ROUTER = validateAddress(process.env.UNISWAP_ROUTER, 'UNISWAP_ROUTER');
        const SUSHISWAP_ROUTER = validateAddress(process.env.SUSHISWAP_ROUTER, 'SUSHISWAP_ROUTER');
        const TOKEN_A = validateAddress(process.env.TOKEN_A, 'TOKEN_A');
        const TOKEN_B = validateAddress(process.env.TOKEN_B, 'TOKEN_B');
        const UNISWAP_PAIR = validateAddress(process.env.UNISWAP_PAIR, 'UNISWAP_PAIR');
        const SUSHISWAP_PAIR = validateAddress(process.env.SUSHISWAP_PAIR, 'SUSHISWAP_PAIR');

        console.log('Validated addresses:', { UNISWAP_ROUTER, SUSHISWAP_ROUTER, TOKEN_A, TOKEN_B, UNISWAP_PAIR, SUSHISWAP_PAIR });

        // Check balances and allowances
        await checkBalanceAndAllowance(TOKEN_A, SUSHISWAP_ROUTER, 'WETH');
        await checkBalanceAndAllowance(TOKEN_B, SUSHISWAP_ROUTER, 'DAI');

        // Mint tokens (skip if already minted)
        await mintTokens(TOKEN_A, ethers.parseUnits('40000', 18), 'WETH');
        await mintTokens(TOKEN_B, ethers.parseUnits('40000000', 18), 'DAI');

        // Approve tokens
        await approveTokens(TOKEN_A, UNISWAP_ROUTER, ethers.parseUnits('3000', 18), 'WETH');
        await approveTokens(TOKEN_B, UNISWAP_ROUTER, ethers.parseUnits('3600000', 18), 'DAI');
        await approveTokens(TOKEN_A, SUSHISWAP_ROUTER, ethers.parseUnits('1000', 18), 'WETH');
        await approveTokens(TOKEN_B, SUSHISWAP_ROUTER, ethers.parseUnits('1000000', 18), 'DAI');

        // Add liquidity
        try {
            await addLiquidity(UNISWAP_ROUTER, TOKEN_A, TOKEN_B, UNISWAP_PAIR);
        } catch (error) {
            console.error('Uniswap liquidity failed, continuing...');
        }
        try {
            await addLiquidity(SUSHISWAP_ROUTER, TOKEN_A, TOKEN_B, SUSHISWAP_PAIR, true);
        } catch (error) {
            console.error('Sushiswap liquidity failed, continuing...');
        }

        // Set prices
        await setPrice(UNISWAP_ROUTER, ethers.parseUnits('1200', 18));
        await setPrice(SUSHISWAP_ROUTER, ethers.parseUnits('1000', 18));
    } catch (error) {
        console.error('Error in funding/liquidity:', error.message);
        if (error.reason) console.error(`Revert reason: ${error.reason}`);
        if (error.data) console.error(`Revert data: ${error.data}`);
        process.exit(1);
    }
}

main();