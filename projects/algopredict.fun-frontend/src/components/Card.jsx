import people from '../assets/Homepage/people.png'
import dollar from '../assets/Homepage/dollar.png'
import trophy from '../assets/Homepage/trophy.png'
import plus from '../assets/Homepage/plus.png'
import algosdk from 'algosdk'
import { formatAmount } from '../utils'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Card = (props) => {

  console.log("props", props)

  const [timeLeft, setTimeLeft] = useState("");
  const [predictionStatus, setPredictionStatus] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(Number(props.prediction.startsAt)).getTime();
      const endTime = new Date(Number(props.prediction.endsAt)).getTime();

      let timeDiff;
      let text;
      if (now < startTime) {
        timeDiff = startTime - now;
        text = "Starts in: ";
        setPredictionStatus("View more");
      } else if (now < endTime) {
        timeDiff = endTime - now;
        text = "Ends in: ";
        setPredictionStatus("Predict");
      } else {
        timeDiff = 0;
        text = "Ended";
        setPredictionStatus("View more");
      }

      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft(timeDiff == 0 ? text : `${text}${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [props.prediction.startsAt, props.prediction.endsAt]);

  const navigator = useNavigate();
  const navigateToPrediction = () => {
    navigator(`/prediction/${props.index}`);
  }


  return (
    <>
      <div className="card_section">
        <div className="card_wrapper">
          <div className="bet_image_div">
            <img src={props.prediction.image} alt="" />
            <p className="card_headline">{props.prediction.question}</p>
          </div>
          <div className="bet_details_div">
            <div className="people_div">
              <img src={people} alt="" />
              <p className='people_count'>{Number(props.prediction.noOfUsers)}</p>
            </div>
            <div className="amount_div">
              <img src={dollar} alt="" />
              <p className='dollar_amount'>{props.user ? props.user.amount : "N/A"}</p>
              {props.user && <svg xmlns="http://www.w3.org/2000/svg" height={"14px"} id="Layer_1" fill='#fff' data-name="Layer 1" viewBox="0 0 113 113.4"><title>algorand-algo-logo</title><polygon points="19.6 113.4 36 85 52.4 56.7 68.7 28.3 71.4 23.8 72.6 28.3 77.6 47 72 56.7 55.6 85 39.3 113.4 58.9 113.4 75.3 85 83.8 70.3 87.8 85 95.4 113.4 113 113.4 105.4 85 97.8 56.7 95.8 49.4 108 28.3 90.2 28.3 89.6 26.2 83.4 3 82.6 0 65.5 0 65.1 0.6 49.1 28.3 32.7 56.7 16.4 85 0 113.4 19.6 113.4" /></svg>}
            </div>
            <div className="trophy_div">
              <img src={trophy} alt="" />
              <p className='trophy_count'>{formatAmount(algosdk.microalgosToAlgos(Number(props.prediction.option1SharesBhougth) + Number(props.prediction.option2SharesBhougth)))} </p>
              <svg xmlns="http://www.w3.org/2000/svg" height={"14px"} id="Layer_1" fill='#fff' data-name="Layer 1" viewBox="0 0 113 113.4"><title>algorand-algo-logo</title><polygon points="19.6 113.4 36 85 52.4 56.7 68.7 28.3 71.4 23.8 72.6 28.3 77.6 47 72 56.7 55.6 85 39.3 113.4 58.9 113.4 75.3 85 83.8 70.3 87.8 85 95.4 113.4 113 113.4 105.4 85 97.8 56.7 95.8 49.4 108 28.3 90.2 28.3 89.6 26.2 83.4 3 82.6 0 65.5 0 65.1 0.6 49.1 28.3 32.7 56.7 16.4 85 0 113.4 19.6 113.4" /></svg>
            </div>
          </div>
          <div className="starts_predic_div">
            <button className='starts_in_btn'>{timeLeft}</button>
            <button onClick={navigateToPrediction} className='predict_btn'>{predictionStatus} <img src={plus} alt="" /></button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Card
