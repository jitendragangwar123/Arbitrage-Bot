
# Arbitrage-Bot

### Deployed Contract Addresses
```shell
  WETH deployed to: 0x8eB58437dF11bcA24eA88698783A0e6e9f7f9119
  MockDAI deployed to: 0xbBd5D5277e1c5b970735077ED514dc5a0f60773A
  Uniswap Factory deployed to: 0x35aE6f851E686A10194043e21Ce8bBf8Ac88feCc
  Sushiswap Factory deployed to: 0x2B3C0E667399e08850A09677D9c9Ad0412eb50F3
  Uniswap Router deployed to: 0xC25623Ef00efa85e2AE28d814A2574f37d53298D
  Sushiswap Router deployed to: 0x608012e378794991C3f351Fdcd59cF007fBfb08f
```


### Result
``shell
2025-07-30T05:27:04.058Z - Wallet WETH balance: 80039000.0
2025-07-30T05:27:04.066Z - Wallet DAI balance: 38880000.0
2025-07-30T05:27:04.067Z - Uniswap Pair Reserves: 1000.0 WETH, 1200000.0 DAI
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