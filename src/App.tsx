import './App.css';
import React, { useMemo } from 'react';

import Home from './Home';

import * as anchor from '@project-serum/anchor';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';

import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';
import { ThemeProvider, createTheme } from '@material-ui/core';
import { ConfettiProvider } from './confetti';
import YoutubeBackground from 'react-youtube-background'

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const candyMachineId = process.env.REACT_APP_CANDY_MACHINE_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID)
  : undefined;

const fairLaunchId = process.env.REACT_APP_FAIR_LAUNCH_ID
  ? new anchor.web3.PublicKey(process.env.REACT_APP_FAIR_LAUNCH_ID)
  : undefined;

const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(rpcHost);

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);

const txTimeout = 30000; // milliseconds (confirm this works for your project)

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    [],
  );

  const videoId = "yEcqxO_gGBw";


  const style = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    // background: "hotpink",
    // height: "180px",
    // overflow: "auto"
  }

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletDialogProvider>
            <ConfettiProvider>
              <YoutubeBackground
                  style={style}
                  videoId={videoId}                /* default -> null */
                  // aspectRatio={string}            /* default -> "16:9" */
                  // overlay={string}                /* default -> null | e.g. "rgba(0,0,0,.4)" */
                  // className={string}              /* default -> null */
                  // nocookie={bool}                 /* default -> false | sets host to https:/*www.youtube-nocookie.com to avoid loading Google's cookies */
                  playerOptions={{modestbranding:1}}          /* default -> {}  | https://developers.google.com/youtube/player_parameters*/
                  // onReady={func}                  /* default -> null | returns event with player object */
                  // onEnd={func}                    /* default -> null | returns event with player object */
                  // onPlay={func}                   /* default -> null | returns event with player object */
                  // onPause={func}                  /* default -> null | returns event with player object */
                  // onError={func}                  /* default -> null | returns event with player object */
                  // onStateChange={func}            /* default -> null | returns event with player object */
                  // onPlaybackRateChange={func}     /* default -> null | returns event with player object */
                  // onPlaybackQualityChange={func}  /* default -> null | returns event with player object */
              >
                <Home
                    candyMachineId={candyMachineId}
                    fairLaunchId={fairLaunchId}
                    connection={connection}
                    startDate={startDateSeed}
                    txTimeout={txTimeout}
                    rpcHost={rpcHost}
                />
              </YoutubeBackground>
            </ConfettiProvider>
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default App;
