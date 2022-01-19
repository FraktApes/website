import * as anchor from '@project-serum/anchor';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { PhaseCountdown } from './countdown';
import { toDate } from './utils';
import { FairLaunchAccount } from './fair-launch';
import { CandyMachineAccount } from './candy-machine';
import { useWallet } from '@solana/wallet-adapter-react';
import '@fortawesome/fontawesome-free/js/all.js';
import {Tooltip} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import makeStyles from "@material-ui/core/styles/makeStyles";

export enum Phase {
  AnticipationPhase, // FL, AKA Phase 0
  SetPrice, // FL, AKA Phase 1
  GracePeriod, // FL, AKA Phase 2
  Lottery, // FL
  RaffleFinished, // FL, AKA Phase 3
  WaitForCM, // FL,
  Phase4,
  Unknown,
}

export function getPhase(
  fairLaunch: FairLaunchAccount | undefined,
  candyMachine: CandyMachineAccount | undefined,
): Phase {
  const curr = new Date().getTime();
  const phaseOne = toDate(fairLaunch?.state.data.phaseOneStart)?.getTime();
  const phaseOneEnd = toDate(fairLaunch?.state.data.phaseOneEnd)?.getTime();
  const phaseTwoEnd = toDate(fairLaunch?.state.data.phaseTwoEnd)?.getTime();
  const candyMachineGoLive = toDate(candyMachine?.state.goLiveDate)?.getTime();

  if (phaseOne && curr < phaseOne) {
    return Phase.AnticipationPhase;
  } else if (phaseOneEnd && curr <= phaseOneEnd) {
    return Phase.SetPrice;
  } else if (phaseTwoEnd && curr <= phaseTwoEnd) {
    return Phase.GracePeriod;
  } else if (
    !fairLaunch?.state.phaseThreeStarted &&
    phaseTwoEnd &&
    curr > phaseTwoEnd
  ) {
    return Phase.Lottery;
  } else if (
    (!fairLaunch || fairLaunch?.state.phaseThreeStarted) &&
    candyMachineGoLive &&
    curr > candyMachineGoLive
  ) {
    return Phase.Phase4;
  } else if (fairLaunch?.state.phaseThreeStarted) {
    if (!candyMachine) {
      return Phase.RaffleFinished;
    } else {
      return Phase.WaitForCM;
    }
  }
  return Phase.Unknown;
}

const useStyles = makeStyles({
  tooltip: {
    fontSize: "1em",
  },
});

const Header = (props: {
  phaseName: string;
  desc: string;
  date: anchor.BN | undefined;
  status?: string;
}) => {
  const { phaseName, desc, date, status } = props;
  const classes = useStyles();
  return (
    <Grid container justifyContent="center">
      <Grid xs={6} justifyContent="center" direction="column" style={{marginTop: 10}}>
        <Typography variant="h4" style={{ fontWeight: 600 }}>
          {phaseName}
        </Typography>
        <Grid container direction="row" >
          <Typography variant="body1" color="textSecondary" style={{marginTop: 10}}>
            {desc}
          </Typography>
          {(phaseName === "Frakt Ape") &&
          <Tooltip classes={{tooltip: classes.tooltip}} title="Your gateway to the world of AI NFTs">
            <IconButton >
              <i className="far fa-question-circle fa-xs" ></i>
            </IconButton>
          </Tooltip>}
        </Grid>

      </Grid>
      <Grid xs={6} container justifyContent="flex-end">
        <PhaseCountdown
          date={toDate(date)}
          style={{ justifyContent: 'flex-end' }}
          status={status || 'COMPLETE'}
        />
      </Grid>
    </Grid>
  );
};

type PhaseHeaderProps = {
  phase: Phase;
  fairLaunch?: FairLaunchAccount;
  candyMachine?: CandyMachineAccount;
  candyMachinePredatesFairLaunch: boolean;
  rpcUrl: string;
};

export const PhaseHeader = ({
  phase,
  fairLaunch,
  candyMachine,
  candyMachinePredatesFairLaunch,
  rpcUrl,
}: PhaseHeaderProps) => {
  const wallet = useWallet();
  console.log('D', candyMachine);
  console.log('Wallet', wallet);

  return (
    <>
      {phase === Phase.AnticipationPhase && (
        <Header
          phaseName={'Phase 0'}
          desc={'Anticipation Phase'}
          date={fairLaunch?.state.data.phaseOneStart}
        />
      )}
      {phase === Phase.SetPrice && (
        <Header
          phaseName={'Phase 1'}
          desc={'Set price phase'}
          date={fairLaunch?.state.data.phaseOneEnd}
        />
      )}

      {phase === Phase.GracePeriod && (
        <Header
          phaseName={'Phase 2'}
          desc={'Grace period'}
          date={fairLaunch?.state.data.phaseTwoEnd}
        />
      )}

      {phase === Phase.Lottery && (
        <Header
          phaseName={'Phase 3'}
          desc={'Raffle in progress'}
          date={fairLaunch?.state.data.phaseTwoEnd.add(
            fairLaunch?.state.data.lotteryDuration,
          )}
        />
      )}

      {phase === Phase.RaffleFinished && (
        <Header
          phaseName={'Phase 3'}
          desc={'Raffle finished!'}
          date={fairLaunch?.state.data.phaseTwoEnd}
        />
      )}

      {phase === Phase.WaitForCM && (
        <Header
          phaseName={'Phase 3'}
          desc={'Minting starts in...'}
          date={candyMachine?.state.goLiveDate}
        />
      )}

      {phase === Phase.Unknown && !candyMachine && (
        <Header
          phaseName={'Loading...'}
          desc={'Please connect your wallet.'}
          date={undefined}
        />
      )}

      {phase === Phase.Phase4 && (
        <Header
          phaseName={"Frakt Ape"}
          desc={'(incl. Neuralism Pass)'}
          date={candyMachine?.state.goLiveDate}
          status="LIVE"
        />
      )}
    </>
  );
};
