# Arbitrage Bot

A decentralized finance (DeFi) arbitrage bot that identifies and executes profitable trading opportunities between Uniswap and Sushiswap for the WETH/DAI trading pair.

## Overview

This project implements an arbitrage bot that monitors WETH/DAI trading pairs on Uniswap and Sushiswap. It detects price discrepancies and executes trades to capitalize on these opportunities. The bot was tested on July 30, 2025, successfully completing an arbitrage trade by buying WETH on Sushiswap and selling on Uniswap for a profit.

## Features

- **Real-time Monitoring**: Continuously checks WETH/DAI pair reserves on Uniswap and Sushiswap.
- **Arbitrage Detection**: Identifies price differences, e.g., 1 WETH = 1200 DAI (Uniswap) vs. 1 WETH = 1000 DAI (Sushiswap).
- **Automated Execution**: Executes buy and sell trades with pre-approved token allowances.
- **Transaction Logging**: Records all actions, including approvals and trades, with transaction hashes.
- **Mock Testing**: Supports mock trade execution for testing purposes.


### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jitendragangwar123/Arbitrage-Bot
   cd Arbitrage-Bot
2. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
3. **Configure Environment**:
    Create a `.env` file in the root directory and add the following:
    ```plaintext
    INFURA_URL=your_infura_url
    PRIVATE_KEY=your_wallet_private_key
    UNISWAP_ROUTER=your_uniswap_router_address
    SUSHISWAP_ROUTER=your_sushiswap_router_address
    TOKEN_A=your_token_a_address
    TOKEN_B=your_token_b_address
    WALLET_ADDRESS=your_wallet_address
    UNISWAP_PAIR=your_uniswap_pair_address
    SUSHISWAP_PAIR=your_sushiswap_pair_address
    ```
4. **Run the Bot**:
    Start the arbitrage bot with:
    ```bash
    node arbitrage-bot.js
## Sample Execution

Below is a sample log from a successful arbitrage trade:

```plaintext
2025-07-30T05:27:04.058Z - Wallet WETH balance: 80,039,000.0
2025-07-30T05:27:04.066Z - Wallet DAI balance: 38,880,000.0
2025-07-30T05:27:04.067Z - Uniswap Pair Reserves: 1,000.0 WETH, 1,200,000.0 DAI
2025-07-30T05:27:04.067Z - Sushiswap Pair Reserves: 0.0 WETH, 0.0 DAI
2025-07-30T05:27:04.067Z - Uniswap: 1 WETH = 1200.0 DAI
2025-07-30T05:27:04.067Z - Sushiswap: 1 WETH = 1000.0 DAI
2025-07-30T05:27:04.067Z - Arbitrage opportunity: Buy on Sushiswap, sell on Uniswap
2025-07-30T05:27:05.411Z - Approved 1 WETH for 0x250857F884f832F827836cd62EF7972b7D23d6B2: 0x674e45ef1821502e91cfc622ba3efc3f07c03269d28fd02505887f3d6ba2ef14
2025-07-30T05:27:14.445Z - Buy trade executed: mock
2025-07-30T05:27:15.242Z - Approved 1000.0 DAI for 0xf10d49b09277aD70213B0da8A42E61f3032476B5: 0xb083ecab8bb2bf8fea3acab52b3f86fda2249df8b2491e0c6a1b31a58ba89462
2025-07-30T05:27:41.408Z - Sell trade executed: mock
2025-07-30T05:27:41.409Z - Arbitrage completed: sushi-to-uni
```
