import '../css/Prediction.css';
import im1 from "../assets/profile.png";
import im2 from "../assets/profile2.png";
import im3 from "../assets/profile3.png";
import im4 from "../assets/profile4.png";
import { toast } from 'react-toastify';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPrediction, getUserPrediction, formatAmount, combineAddressAndUint64 } from '../utils';
import { APP_ADDRESS, APP_ADMIN, Caller, algorandClient } from '../config';
import algosdk from 'algosdk';
import * as algokit from "@algorandfoundation/algokit-utils";


export const Prediction = ({ activeAccount, transactionSigner }) => {
  const [selectedOption, setSelectedOption] = useState(1);
  const [betAmount, setBetAmount] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [startsIn, setStartsIn] = useState("00:00:00");
  const [endsIn, setEndsIn] = useState("00:00:00");
  const [predictionStatus, setPredictionStatus] = useState("");
  const [estimatedPayout, setEstimatedPayout] = useState(0);

  useEffect(() => {
    if (!activeAccount) {
      toast.error("Please connect your wallet to bet");
      navigate('/');
    }

    const fetchPrediction = async () => {
      // fetch prediction details
      // get id
      console.log(id)

      const p = await getPrediction(Caller, id);

      console.log(p)
      if (!p) {
        toast.error("Prediction not found");
        navigate('/');
        return;
      }

      const user = await getUserPrediction(Caller, activeAccount.address, id);

      if (user) {
        setPrediction({
          prediction: p,
          user,
        });
      } else {
        setPrediction({ prediction: p, user: null });
      }

    }

    fetchPrediction();
  }, [activeAccount]);

  const [claimAmount, setClaimAmount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (prediction) {
        const now = new Date().getTime();
        const startTime = new Date(Number(prediction.prediction.startsAt) * 1000).getTime();
        const endTime = new Date(Number(prediction.prediction.endsAt) * 1000).getTime();


        if (now < startTime) {
          setPredictionStatus("not_started");
          const timeDiff = startTime - now;
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          const timeDiff2 = endTime - now;
          const hours2 = Math.floor((timeDiff2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes2 = Math.floor((timeDiff2 % (1000 * 60 * 60)) / (1000 * 60));
          const seconds2 = Math.floor((timeDiff2 % (1000 * 60)) / 1000);
          setStartsIn(`${hours}h ${minutes}m ${seconds}s`);
          setEndsIn(`${hours2}h ${minutes2}m ${seconds2}s`);
        } else if (now < endTime) {
          setPredictionStatus("started");
          setStartsIn("Started");
          const timeDiff = endTime - now;
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setEndsIn(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setPredictionStatus("ended");
          setStartsIn("Ended");
          setEndsIn("Ended");
        }
      }
    }, 1000);


    if (prediction) {
      if (prediction.user) {
        const previousAmount = Number(prediction.user.amount);
        setBetAmount(algosdk.microalgosToAlgos(previousAmount));
        setSelectedOption(prediction.user.option);
        const option1 = Number(prediction.prediction.option1SharesBhougth);
        const option2 = Number(prediction.prediction.option2SharesBhougth);
        const total = option1 + option2;
        if (prediction.user.option == 1) {
          setEstimatedPayout(algosdk.microalgosToAlgos(Number((previousAmount * total) / option1)));
        } else if (prediction.user.option == 2) {
          setEstimatedPayout(algosdk.microalgosToAlgos(Number((previousAmount * total) / option2)));
        } else {
          setEstimatedPayout(0);
        }

        if (Number(prediction.prediction.result) != 0) {
          if (Number(prediction.user.claimed) == 0) {
            const previousAmount = Number(prediction.user.amount);
            const option1 = Number(prediction.prediction.option1SharesBhougth);
            const option2 = Number(prediction.prediction.option2SharesBhougth);
            const total = option1 + option2;
            if (prediction.user.option == 1) {
              setClaimAmount(algosdk.microalgosToAlgos(Number((previousAmount * total) / option1)));
            } else if (prediction.user.option == 2) {
              setClaimAmount(algosdk.microalgosToAlgos(Number((previousAmount * total) / option2)));
            } else {
              setClaimAmount(0);
            }
          }
        }
      }
    }

    return () => clearInterval(interval);
  }, [prediction]);

  useEffect(() => {
    if (betAmount > 0 && prediction) {
      let option1 = Number(prediction.prediction.option1SharesBhougth);
      let option2 = Number(prediction.prediction.option2SharesBhougth);
      console.log(option1, option2, betAmount)
      const total = option1 + option2 + betAmount;
      if (selectedOption == 1) {
        option1 += betAmount;
        console.log("first", betAmount * (total / option1))
        setEstimatedPayout(betAmount * (total / option1));
      } else if (selectedOption == 2) {
        option2 += betAmount;
        setEstimatedPayout(betAmount * (total / option2));
      } else {
        setEstimatedPayout(0);
      }
    } else {
      setEstimatedPayout(0);
    }
  }, [betAmount, selectedOption]);

  const [submitting, setSubmitting] = useState("");

  const addBet = async () => {
    if (betAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }


    try {
      const encoder = new TextEncoder();
      if (!prediction.user) {
        setSubmitting("Adding bet...");
        const paytxn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: APP_ADDRESS,
          amount: algokit.algos(betAmount).microAlgos,
          suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
        });
        const newUserBuy0 = await Caller.compose().buyShares(
          { predictionId: Number(id), option: selectedOption, amount: algokit.algos(betAmount).microAlgos, payTxn: paytxn0 },
          {
            sender: { addr: activeAccount.address, signer: transactionSigner },
            boxes: [
              { appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) },
              { appIndex: 0, name: combineAddressAndUint64(activeAccount.address, Number(id)) },
            ],
            note: encoder.encode(`addbet-${selectedOption}-${betAmount}`),
          }
        ).atc();
        setSubmitting("Sign Transaction...");
        toast.info("Sign Transaction...");
        await newUserBuy0.gatherSignatures();
        setSubmitting("Submiting Transaction...");
        const res = await newUserBuy0.execute(algorandClient.client.algod, 3);
        toast.success("Bet added successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
        setSubmitting("");
        window.location.reload();
      } else {
        const previousAmount = Number(prediction.user.amount);
        const previousOption = Number(prediction.user.option);
        let diff;
        if (previousAmount >= betAmount) {
          diff = 0;
        } else {
          diff = betAmount - previousAmount;
        }
        setSubmitting("Changing bet...");
        const paytxn0 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: activeAccount.address,
          to: APP_ADDRESS,
          amount: algokit.algos(diff).microAlgos,
          suggestedParams: await algorandClient.client.algod.getTransactionParams().do(),
        });
        const changeBet = await Caller.compose().changeBet(
          { predictionId: Number(id), option: selectedOption, amount: algokit.algos(betAmount).microAlgos, payTxn: paytxn0 },
          {
            sender: { addr: activeAccount.address, signer: transactionSigner },
            boxes: [
              { appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) },
              { appIndex: 0, name: combineAddressAndUint64(activeAccount.address, Number(id)) },
            ],
            note: encoder.encode(`addbet-${selectedOption}-${betAmount}`),
          }
        ).atc();
        setSubmitting("Sign Transaction...");
        toast.info("Sign Transaction...");
        await changeBet.gatherSignatures();
        setSubmitting("Submiting Transaction...");
        const res = await changeBet.execute(algorandClient.client.algod, 3);
        toast.success("Bet changed successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
        setSubmitting("");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      toast.error(`Failed to add bet: ${e.message}`);
      setSubmitting("");
    }
  }

  const [resultOption, setResultOption] = useState(3);

  const announceResult = async () => {
    try {
      if (activeAccount.address !== APP_ADMIN) {
        toast.error("You are not authorized to announce result");
        return;
      }

      setSubmitting("Announcing result...");
      const endPrediction = await Caller.compose().endPrediction(
        { predictionId: Number(id), result: resultOption },
        { sender: { addr: activeAccount.address, signer: transactionSigner }, boxes: [{ appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) }] }
      ).atc();
      setSubmitting("Sign Transaction...");
      toast.info("Sign Transaction...");
      await endPrediction.gatherSignatures();
      setSubmitting("Submiting Transaction...");
      const res = await endPrediction.execute(algorandClient.client.algod, 3);
      toast.success("Result announced successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
      setSubmitting("");
      window.location.reload();

    } catch (e) {
      console.error(e);
      setSubmitting("");
      toast.error(`Failed to announce result: ${e.message}`);
    }

  };

  const claimReward = async () => {
    try {
      setSubmitting("Claiming reward...");
      const adminClaim = await Caller.compose().claimReward(
        { predictionId: Number(id) },
        {
          sender: { addr: activeAccount.address, signer: transactionSigner },
          boxes: [
            { appIndex: 0, name: algosdk.bigIntToBytes(Number(id), 8) },
            { appIndex: 0, name: combineAddressAndUint64(activeAccount.address, Number(id)) },
          ],
          sendParams: { fee: algokit.algos(0.002) },
        }
      ).atc();
      setSubmitting("Sign Transaction...");
      toast.info("Sign Transaction...");
      await adminClaim.gatherSignatures();
      setSubmitting("Submiting Transaction...");
      const res = await adminClaim.execute(algorandClient.client.algod, 3);
      toast.success("Reward claimed successfully", { onClick: () => window.open(`${TXN_URL}${res.txIDs[0]}`) });
      setSubmitting("");
    } catch (e) {
      console.error(e);
      setSubmitting("");
      toast.error(`Failed to claim reward: ${e.message}`);
    }
  }

  console.log(prediction, "prediction")
  return (
    <div className="betting-screen">
      <div className='details-wrapper'>
        <div className="left-panel">
          <div className='back-button'>
            <button onClick={(_) => navigate("/")}><svg width="16" height="16" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.0452 5.99908L7.50016 10.4541L6.22756 11.7267L0.5 5.99908L6.22756 0.271484L7.50016 1.54408L3.0452 5.99908Z" fill="white" />
            </svg>
            </button>
          </div>
          <div className="prediction-title">
            <h1>{prediction && prediction.prediction.question}</h1>
          </div>
          <div className="participants-container">
            <div className="participants-label">Participants</div>
            <div className="avatars">
              <img src={im1} alt={`Participant`} className="avatar" />
              <img src={im2} alt={`Participant`} className="avatar" />
              <img src={im3} alt={`Participant`} className="avatar" />
              <img src={im4} alt={`Participant`} className="avatar" />

              <span className="more-count">+{prediction && Number(prediction.prediction.noOfUsers)}</span>
            </div>
          </div>

          <div className="info-cards-container">
            <div className="info-card">
              <span className="info-label">Starts in:</span>
              <span className="info-value">{startsIn}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Expires in:</span>
              <span className="info-value">{endsIn}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Prize Pool</span>
              <span className="info-value">{prediction && formatAmount(algosdk.microalgosToAlgos(Number(prediction.prediction.option1SharesBhougth) + Number(prediction.prediction.option2SharesBhougth)))} ALGO</span>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="image-container">
            <img src={prediction && prediction.prediction.image} alt="Trump" />
          </div>
        </div>
      </div>


      <div className="tabs">
        <button className="active-tab">Predict</button>
        <button>Activity</button>
      </div>

      <div className="bet-section">
        {predictionStatus == "not_started" && <div className="betting-not-started">Bet Not Started Yet</div>}
        {predictionStatus == "ended" && <div className="betting-ended"><p>Bet Ended</p><br></br>{prediction.user ? Number(prediction.prediction.result) != 0 ? Number(prediction.user.claim) == 1 ? "You have claimed you reward" : <>Claim your Reward<br /><button disabled={submitting == "" ? false : true} className='bet-button' onClick={(_) => { claimReward() }}>Claim {claimAmount} ALGO</button></> : (<>Result isn't announced Yet<br />You have Placed {algosdk.microalgosToAlgos(Number(prediction.user.amount))} Algo Bet</>) : "You haven't placed any bet"}</div>}
        {predictionStatus == "started" && <div className="betting-started">
          <h2>Select your bets</h2>
          <p>Just tap on the option to select your bet</p>
          <div className="bets">
            <button onClick={(_) => setSelectedOption(1)} className={`bet-button ${selectedOption == 1 && "active"}`}>{prediction.prediction && prediction.prediction.option1}
              {selectedOption == 1 && <svg width="18" height="18" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="62" height="62" rx="31" fill="white" fill-opacity="0.1" />
                <path d="M20.5 30.4382H23.125C23.8522 30.4382 24.4376 31.0236 24.4376 31.7508V43.5634C24.4376 44.2906 23.8522 44.876 23.125 44.876H20.5V30.4382Z" fill="#E4EFF8" />
                <path d="M33.6252 25.6394C33.6252 22.3713 29.6876 21.7018 29.6876 23.6706C29.6876 26.3106 28.4165 29.1262 26.795 30.0624C25.8194 30.6257 23.7812 31.0946 23.7812 33.2889V42.2516C23.7812 43.3419 24.6557 44.2197 25.7418 44.2197H37.5628C38.6489 44.2197 39.1799 43.2859 39.5234 42.2516C40.5037 39.2994 42.1566 34.0467 42.1566 33.0627C42.1566 31.9723 41.274 31.0946 40.1878 31.0946H33.6252V25.6394Z" fill="#FFC6A0" />
                <path d="M38.8754 31.0945C39.9615 31.0945 40.8441 31.9716 40.8441 33.062C40.8441 34.046 39.1917 39.2987 38.2114 42.2509C37.8679 43.2853 37.3365 44.2197 36.2503 44.2197H37.5628C38.649 44.2197 39.1804 43.2853 39.5239 42.2509C40.5042 39.2987 42.1567 34.046 42.1567 33.062C42.1567 31.9716 41.274 31.0945 40.1879 31.0945H38.8754ZM30.3145 22.6835C31.3087 23.0033 32.3127 23.9887 32.3127 25.6393V30.4382C32.3127 30.8017 32.6054 31.0944 32.969 31.0944C33.3326 31.0944 33.6252 31.0945 33.6252 31.0945V25.6393C33.6252 23.5967 32.0871 22.5696 30.9335 22.5669C30.7073 22.5664 30.4966 22.6051 30.3145 22.6835Z" fill="#FFAF7A" />
                <path d="M21.8125 30.4382C22.5397 30.4382 23.125 31.0236 23.125 31.7508V43.5634C23.125 44.2906 22.5397 44.876 21.8125 44.876H23.125C23.8522 44.876 24.4376 44.2906 24.4376 43.5634V31.7508C24.4376 31.0236 23.8522 30.4382 23.125 30.4382H21.8125ZM20.5 30.4382V44.876H21.8125V30.4382H20.5Z" fill="#C4DCF0" />
                <path d="M30.9236 16.6568C30.5879 16.6953 30.3363 16.9825 30.3423 17.3205V19.2873C30.3423 20.1625 31.6552 20.1625 31.6552 19.2873V17.3205C31.6622 16.9235 31.318 16.6112 30.9236 16.6568ZM26.3117 17.8824C25.7213 17.8826 25.4314 18.6013 25.8563 19.0112L27.2467 20.4015C27.8631 21.062 28.8341 20.0961 28.1768 19.4762L26.7865 18.081C26.6619 17.953 26.4904 17.8812 26.3117 17.8824Z" fill="#FF9751" />
                <path d="M12.625 29.1257H19.844C20.5711 29.1257 21.1565 29.7111 21.1565 30.4383V44.876C21.1565 45.6031 20.5711 46.1885 19.844 46.1885H12.625C11.8979 46.1885 11.3125 45.6031 11.3125 44.876V30.4383C11.3125 29.7111 11.8979 29.1257 12.625 29.1257Z" fill="#FF9751" />
                <path d="M18.5312 29.1257C19.2584 29.1257 19.8438 29.7111 19.8438 30.4382V44.876C19.8438 45.6031 19.2584 46.1885 18.5312 46.1885H19.8438C20.5709 46.1885 21.1563 45.6031 21.1563 44.876V30.4382C21.1563 29.7111 20.5709 29.1257 19.8438 29.1257H18.5312Z" fill="#FF7F29" />
                <path d="M18.5313 43.5635C18.5313 43.9259 18.2375 44.2197 17.875 44.2197C17.5126 44.2197 17.2188 43.9259 17.2188 43.5635C17.2187 43.201 17.5126 42.9072 17.875 42.9072C18.2375 42.9072 18.5313 43.201 18.5313 43.5635Z" fill="#E4EFF8" />
                <path d="M35.6958 17.8823C36.2862 17.8825 36.5761 18.6013 36.1512 19.0111L34.7608 20.4014C34.1444 21.0619 33.1734 20.096 33.8307 19.4762L35.221 18.081C35.3456 17.9529 35.5171 17.8812 35.6958 17.8823Z" fill="#FF9751" />
              </svg>}
            </button>
            <button onClick={(_) => setSelectedOption(2)} className={`bet-button ${selectedOption == 2 && "active"}`}>{prediction.prediction && prediction.prediction.option2}
              {selectedOption == 2 && <svg width="18" height="18" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="62" height="62" rx="31" fill="white" fill-opacity="0.1" />
                <path d="M20.5 30.4382H23.125C23.8522 30.4382 24.4376 31.0236 24.4376 31.7508V43.5634C24.4376 44.2906 23.8522 44.876 23.125 44.876H20.5V30.4382Z" fill="#E4EFF8" />
                <path d="M33.6252 25.6394C33.6252 22.3713 29.6876 21.7018 29.6876 23.6706C29.6876 26.3106 28.4165 29.1262 26.795 30.0624C25.8194 30.6257 23.7812 31.0946 23.7812 33.2889V42.2516C23.7812 43.3419 24.6557 44.2197 25.7418 44.2197H37.5628C38.6489 44.2197 39.1799 43.2859 39.5234 42.2516C40.5037 39.2994 42.1566 34.0467 42.1566 33.0627C42.1566 31.9723 41.274 31.0946 40.1878 31.0946H33.6252V25.6394Z" fill="#FFC6A0" />
                <path d="M38.8754 31.0945C39.9615 31.0945 40.8441 31.9716 40.8441 33.062C40.8441 34.046 39.1917 39.2987 38.2114 42.2509C37.8679 43.2853 37.3365 44.2197 36.2503 44.2197H37.5628C38.649 44.2197 39.1804 43.2853 39.5239 42.2509C40.5042 39.2987 42.1567 34.046 42.1567 33.062C42.1567 31.9716 41.274 31.0945 40.1879 31.0945H38.8754ZM30.3145 22.6835C31.3087 23.0033 32.3127 23.9887 32.3127 25.6393V30.4382C32.3127 30.8017 32.6054 31.0944 32.969 31.0944C33.3326 31.0944 33.6252 31.0945 33.6252 31.0945V25.6393C33.6252 23.5967 32.0871 22.5696 30.9335 22.5669C30.7073 22.5664 30.4966 22.6051 30.3145 22.6835Z" fill="#FFAF7A" />
                <path d="M21.8125 30.4382C22.5397 30.4382 23.125 31.0236 23.125 31.7508V43.5634C23.125 44.2906 22.5397 44.876 21.8125 44.876H23.125C23.8522 44.876 24.4376 44.2906 24.4376 43.5634V31.7508C24.4376 31.0236 23.8522 30.4382 23.125 30.4382H21.8125ZM20.5 30.4382V44.876H21.8125V30.4382H20.5Z" fill="#C4DCF0" />
                <path d="M30.9236 16.6568C30.5879 16.6953 30.3363 16.9825 30.3423 17.3205V19.2873C30.3423 20.1625 31.6552 20.1625 31.6552 19.2873V17.3205C31.6622 16.9235 31.318 16.6112 30.9236 16.6568ZM26.3117 17.8824C25.7213 17.8826 25.4314 18.6013 25.8563 19.0112L27.2467 20.4015C27.8631 21.062 28.8341 20.0961 28.1768 19.4762L26.7865 18.081C26.6619 17.953 26.4904 17.8812 26.3117 17.8824Z" fill="#FF9751" />
                <path d="M12.625 29.1257H19.844C20.5711 29.1257 21.1565 29.7111 21.1565 30.4383V44.876C21.1565 45.6031 20.5711 46.1885 19.844 46.1885H12.625C11.8979 46.1885 11.3125 45.6031 11.3125 44.876V30.4383C11.3125 29.7111 11.8979 29.1257 12.625 29.1257Z" fill="#FF9751" />
                <path d="M18.5312 29.1257C19.2584 29.1257 19.8438 29.7111 19.8438 30.4382V44.876C19.8438 45.6031 19.2584 46.1885 18.5312 46.1885H19.8438C20.5709 46.1885 21.1563 45.6031 21.1563 44.876V30.4382C21.1563 29.7111 20.5709 29.1257 19.8438 29.1257H18.5312Z" fill="#FF7F29" />
                <path d="M18.5313 43.5635C18.5313 43.9259 18.2375 44.2197 17.875 44.2197C17.5126 44.2197 17.2188 43.9259 17.2188 43.5635C17.2187 43.201 17.5126 42.9072 17.875 42.9072C18.2375 42.9072 18.5313 43.201 18.5313 43.5635Z" fill="#E4EFF8" />
                <path d="M35.6958 17.8823C36.2862 17.8825 36.5761 18.6013 36.1512 19.0111L34.7608 20.4014C34.1444 21.0619 33.1734 20.096 33.8307 19.4762L35.221 18.081C35.3456 17.9529 35.5171 17.8812 35.6958 17.8823Z" fill="#FF9751" />
              </svg>}
            </button>
          </div><br></br>
          <p>Enter your bet amount</p>
          <div className="bet-amount">
            <input type="number" placeholder="Enter Bet Amount" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} />
          </div>
          <div className="payout">
            <span>Estimated Payout</span>
            <span className="amount">{estimatedPayout} ALGO</span>
          </div>
          <button onClick={(_) => addBet()} disabled={submitting == "" ? false : true} className="wallet-button">{submitting != "" ? submitting : prediction.user ? "Change Bet" : "Add Bet"}</button>
        </div>}
      </div>

      {activeAccount && activeAccount.address == APP_ADMIN && predictionStatus == "ended" && Number(prediction.prediction.result) == 0 && <div style={{ marginTop: "16px" }} className="bet-section">
        <h2>Admin Annonce Result</h2>
        <p>Just Click on any Option to declare result</p>
        <div className="bets">
          <button onClick={(_) => setResultOption(1)} className={`bet-button ${resultOption == 1 && "active"}`}>{prediction.prediction && prediction.prediction.option1}
            {resultOption == 1 && <svg width="18" height="18" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="62" height="62" rx="31" fill="white" fill-opacity="0.1" />
              <path d="M20.5 30.4382H23.125C23.8522 30.4382 24.4376 31.0236 24.4376 31.7508V43.5634C24.4376 44.2906 23.8522 44.876 23.125 44.876H20.5V30.4382Z" fill="#E4EFF8" />
              <path d="M33.6252 25.6394C33.6252 22.3713 29.6876 21.7018 29.6876 23.6706C29.6876 26.3106 28.4165 29.1262 26.795 30.0624C25.8194 30.6257 23.7812 31.0946 23.7812 33.2889V42.2516C23.7812 43.3419 24.6557 44.2197 25.7418 44.2197H37.5628C38.6489 44.2197 39.1799 43.2859 39.5234 42.2516C40.5037 39.2994 42.1566 34.0467 42.1566 33.0627C42.1566 31.9723 41.274 31.0946 40.1878 31.0946H33.6252V25.6394Z" fill="#FFC6A0" />
              <path d="M38.8754 31.0945C39.9615 31.0945 40.8441 31.9716 40.8441 33.062C40.8441 34.046 39.1917 39.2987 38.2114 42.2509C37.8679 43.2853 37.3365 44.2197 36.2503 44.2197H37.5628C38.649 44.2197 39.1804 43.2853 39.5239 42.2509C40.5042 39.2987 42.1567 34.046 42.1567 33.062C42.1567 31.9716 41.274 31.0945 40.1879 31.0945H38.8754ZM30.3145 22.6835C31.3087 23.0033 32.3127 23.9887 32.3127 25.6393V30.4382C32.3127 30.8017 32.6054 31.0944 32.969 31.0944C33.3326 31.0944 33.6252 31.0945 33.6252 31.0945V25.6393C33.6252 23.5967 32.0871 22.5696 30.9335 22.5669C30.7073 22.5664 30.4966 22.6051 30.3145 22.6835Z" fill="#FFAF7A" />
              <path d="M21.8125 30.4382C22.5397 30.4382 23.125 31.0236 23.125 31.7508V43.5634C23.125 44.2906 22.5397 44.876 21.8125 44.876H23.125C23.8522 44.876 24.4376 44.2906 24.4376 43.5634V31.7508C24.4376 31.0236 23.8522 30.4382 23.125 30.4382H21.8125ZM20.5 30.4382V44.876H21.8125V30.4382H20.5Z" fill="#C4DCF0" />
              <path d="M30.9236 16.6568C30.5879 16.6953 30.3363 16.9825 30.3423 17.3205V19.2873C30.3423 20.1625 31.6552 20.1625 31.6552 19.2873V17.3205C31.6622 16.9235 31.318 16.6112 30.9236 16.6568ZM26.3117 17.8824C25.7213 17.8826 25.4314 18.6013 25.8563 19.0112L27.2467 20.4015C27.8631 21.062 28.8341 20.0961 28.1768 19.4762L26.7865 18.081C26.6619 17.953 26.4904 17.8812 26.3117 17.8824Z" fill="#FF9751" />
              <path d="M12.625 29.1257H19.844C20.5711 29.1257 21.1565 29.7111 21.1565 30.4383V44.876C21.1565 45.6031 20.5711 46.1885 19.844 46.1885H12.625C11.8979 46.1885 11.3125 45.6031 11.3125 44.876V30.4383C11.3125 29.7111 11.8979 29.1257 12.625 29.1257Z" fill="#FF9751" />
              <path d="M18.5312 29.1257C19.2584 29.1257 19.8438 29.7111 19.8438 30.4382V44.876C19.8438 45.6031 19.2584 46.1885 18.5312 46.1885H19.8438C20.5709 46.1885 21.1563 45.6031 21.1563 44.876V30.4382C21.1563 29.7111 20.5709 29.1257 19.8438 29.1257H18.5312Z" fill="#FF7F29" />
              <path d="M18.5313 43.5635C18.5313 43.9259 18.2375 44.2197 17.875 44.2197C17.5126 44.2197 17.2188 43.9259 17.2188 43.5635C17.2187 43.201 17.5126 42.9072 17.875 42.9072C18.2375 42.9072 18.5313 43.201 18.5313 43.5635Z" fill="#E4EFF8" />
              <path d="M35.6958 17.8823C36.2862 17.8825 36.5761 18.6013 36.1512 19.0111L34.7608 20.4014C34.1444 21.0619 33.1734 20.096 33.8307 19.4762L35.221 18.081C35.3456 17.9529 35.5171 17.8812 35.6958 17.8823Z" fill="#FF9751" />
            </svg>}
          </button>
          <button onClick={(_) => setResultOption(2)} className={`bet-button ${resultOption == 2 && "active"}`}>{prediction.prediction && prediction.prediction.option2}
            {resultOption == 2 && <svg width="18" height="18" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="62" height="62" rx="31" fill="white" fill-opacity="0.1" />
              <path d="M20.5 30.4382H23.125C23.8522 30.4382 24.4376 31.0236 24.4376 31.7508V43.5634C24.4376 44.2906 23.8522 44.876 23.125 44.876H20.5V30.4382Z" fill="#E4EFF8" />
              <path d="M33.6252 25.6394C33.6252 22.3713 29.6876 21.7018 29.6876 23.6706C29.6876 26.3106 28.4165 29.1262 26.795 30.0624C25.8194 30.6257 23.7812 31.0946 23.7812 33.2889V42.2516C23.7812 43.3419 24.6557 44.2197 25.7418 44.2197H37.5628C38.6489 44.2197 39.1799 43.2859 39.5234 42.2516C40.5037 39.2994 42.1566 34.0467 42.1566 33.0627C42.1566 31.9723 41.274 31.0946 40.1878 31.0946H33.6252V25.6394Z" fill="#FFC6A0" />
              <path d="M38.8754 31.0945C39.9615 31.0945 40.8441 31.9716 40.8441 33.062C40.8441 34.046 39.1917 39.2987 38.2114 42.2509C37.8679 43.2853 37.3365 44.2197 36.2503 44.2197H37.5628C38.649 44.2197 39.1804 43.2853 39.5239 42.2509C40.5042 39.2987 42.1567 34.046 42.1567 33.062C42.1567 31.9716 41.274 31.0945 40.1879 31.0945H38.8754ZM30.3145 22.6835C31.3087 23.0033 32.3127 23.9887 32.3127 25.6393V30.4382C32.3127 30.8017 32.6054 31.0944 32.969 31.0944C33.3326 31.0944 33.6252 31.0945 33.6252 31.0945V25.6393C33.6252 23.5967 32.0871 22.5696 30.9335 22.5669C30.7073 22.5664 30.4966 22.6051 30.3145 22.6835Z" fill="#FFAF7A" />
              <path d="M21.8125 30.4382C22.5397 30.4382 23.125 31.0236 23.125 31.7508V43.5634C23.125 44.2906 22.5397 44.876 21.8125 44.876H23.125C23.8522 44.876 24.4376 44.2906 24.4376 43.5634V31.7508C24.4376 31.0236 23.8522 30.4382 23.125 30.4382H21.8125ZM20.5 30.4382V44.876H21.8125V30.4382H20.5Z" fill="#C4DCF0" />
              <path d="M30.9236 16.6568C30.5879 16.6953 30.3363 16.9825 30.3423 17.3205V19.2873C30.3423 20.1625 31.6552 20.1625 31.6552 19.2873V17.3205C31.6622 16.9235 31.318 16.6112 30.9236 16.6568ZM26.3117 17.8824C25.7213 17.8826 25.4314 18.6013 25.8563 19.0112L27.2467 20.4015C27.8631 21.062 28.8341 20.0961 28.1768 19.4762L26.7865 18.081C26.6619 17.953 26.4904 17.8812 26.3117 17.8824Z" fill="#FF9751" />
              <path d="M12.625 29.1257H19.844C20.5711 29.1257 21.1565 29.7111 21.1565 30.4383V44.876C21.1565 45.6031 20.5711 46.1885 19.844 46.1885H12.625C11.8979 46.1885 11.3125 45.6031 11.3125 44.876V30.4383C11.3125 29.7111 11.8979 29.1257 12.625 29.1257Z" fill="#FF9751" />
              <path d="M18.5312 29.1257C19.2584 29.1257 19.8438 29.7111 19.8438 30.4382V44.876C19.8438 45.6031 19.2584 46.1885 18.5312 46.1885H19.8438C20.5709 46.1885 21.1563 45.6031 21.1563 44.876V30.4382C21.1563 29.7111 20.5709 29.1257 19.8438 29.1257H18.5312Z" fill="#FF7F29" />
              <path d="M18.5313 43.5635C18.5313 43.9259 18.2375 44.2197 17.875 44.2197C17.5126 44.2197 17.2188 43.9259 17.2188 43.5635C17.2187 43.201 17.5126 42.9072 17.875 42.9072C18.2375 42.9072 18.5313 43.201 18.5313 43.5635Z" fill="#E4EFF8" />
              <path d="M35.6958 17.8823C36.2862 17.8825 36.5761 18.6013 36.1512 19.0111L34.7608 20.4014C34.1444 21.0619 33.1734 20.096 33.8307 19.4762L35.221 18.081C35.3456 17.9529 35.5171 17.8812 35.6958 17.8823Z" fill="#FF9751" />
            </svg>}
          </button>
          <button onClick={(_) => setResultOption(3)} className={`bet-button ${resultOption == 3 && "active"}`}>Refund Bet
            {resultOption == 3 && <svg width="18" height="18" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="62" height="62" rx="31" fill="white" fill-opacity="0.1" />
              <path d="M20.5 30.4382H23.125C23.8522 30.4382 24.4376 31.0236 24.4376 31.7508V43.5634C24.4376 44.2906 23.8522 44.876 23.125 44.876H20.5V30.4382Z" fill="#E4EFF8" />
              <path d="M33.6252 25.6394C33.6252 22.3713 29.6876 21.7018 29.6876 23.6706C29.6876 26.3106 28.4165 29.1262 26.795 30.0624C25.8194 30.6257 23.7812 31.0946 23.7812 33.2889V42.2516C23.7812 43.3419 24.6557 44.2197 25.7418 44.2197H37.5628C38.6489 44.2197 39.1799 43.2859 39.5234 42.2516C40.5037 39.2994 42.1566 34.0467 42.1566 33.0627C42.1566 31.9723 41.274 31.0946 40.1878 31.0946H33.6252V25.6394Z" fill="#FFC6A0" />
              <path d="M38.8754 31.0945C39.9615 31.0945 40.8441 31.9716 40.8441 33.062C40.8441 34.046 39.1917 39.2987 38.2114 42.2509C37.8679 43.2853 37.3365 44.2197 36.2503 44.2197H37.5628C38.649 44.2197 39.1804 43.2853 39.5239 42.2509C40.5042 39.2987 42.1567 34.046 42.1567 33.062C42.1567 31.9716 41.274 31.0945 40.1879 31.0945H38.8754ZM30.3145 22.6835C31.3087 23.0033 32.3127 23.9887 32.3127 25.6393V30.4382C32.3127 30.8017 32.6054 31.0944 32.969 31.0944C33.3326 31.0944 33.6252 31.0945 33.6252 31.0945V25.6393C33.6252 23.5967 32.0871 22.5696 30.9335 22.5669C30.7073 22.5664 30.4966 22.6051 30.3145 22.6835Z" fill="#FFAF7A" />
              <path d="M21.8125 30.4382C22.5397 30.4382 23.125 31.0236 23.125 31.7508V43.5634C23.125 44.2906 22.5397 44.876 21.8125 44.876H23.125C23.8522 44.876 24.4376 44.2906 24.4376 43.5634V31.7508C24.4376 31.0236 23.8522 30.4382 23.125 30.4382H21.8125ZM20.5 30.4382V44.876H21.8125V30.4382H20.5Z" fill="#C4DCF0" />
              <path d="M30.9236 16.6568C30.5879 16.6953 30.3363 16.9825 30.3423 17.3205V19.2873C30.3423 20.1625 31.6552 20.1625 31.6552 19.2873V17.3205C31.6622 16.9235 31.318 16.6112 30.9236 16.6568ZM26.3117 17.8824C25.7213 17.8826 25.4314 18.6013 25.8563 19.0112L27.2467 20.4015C27.8631 21.062 28.8341 20.0961 28.1768 19.4762L26.7865 18.081C26.6619 17.953 26.4904 17.8812 26.3117 17.8824Z" fill="#FF9751" />
              <path d="M12.625 29.1257H19.844C20.5711 29.1257 21.1565 29.7111 21.1565 30.4383V44.876C21.1565 45.6031 20.5711 46.1885 19.844 46.1885H12.625C11.8979 46.1885 11.3125 45.6031 11.3125 44.876V30.4383C11.3125 29.7111 11.8979 29.1257 12.625 29.1257Z" fill="#FF9751" />
              <path d="M18.5312 29.1257C19.2584 29.1257 19.8438 29.7111 19.8438 30.4382V44.876C19.8438 45.6031 19.2584 46.1885 18.5312 46.1885H19.8438C20.5709 46.1885 21.1563 45.6031 21.1563 44.876V30.4382C21.1563 29.7111 20.5709 29.1257 19.8438 29.1257H18.5312Z" fill="#FF7F29" />
              <path d="M18.5313 43.5635C18.5313 43.9259 18.2375 44.2197 17.875 44.2197C17.5126 44.2197 17.2188 43.9259 17.2188 43.5635C17.2187 43.201 17.5126 42.9072 17.875 42.9072C18.2375 42.9072 18.5313 43.201 18.5313 43.5635Z" fill="#E4EFF8" />
              <path d="M35.6958 17.8823C36.2862 17.8825 36.5761 18.6013 36.1512 19.0111L34.7608 20.4014C34.1444 21.0619 33.1734 20.096 33.8307 19.4762L35.221 18.081C35.3456 17.9529 35.5171 17.8812 35.6958 17.8823Z" fill="#FF9751" />
            </svg>}
          </button>
        </div>
        <button onClick={(_) => announceResult()} disabled={submitting == "" ? false : true} className="wallet-button">{submitting != "" ? submitting : "Announce Result"}</button>
      </div>}
    </div >


  );
};
