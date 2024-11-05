export const Prediction = ({ prediction }) => {
  return (
    <div className="prediction_card">
      <div className="prediction_card_img">
        <img src={prediction.imageUrl} alt="" />
      </div>
      <div className="prediction_card_content">
        <h3>{prediction.predictionTitle}</h3>
        <p>{prediction.predictionOption1}</p>
        <p>{prediction.predictionOption2}</p>
        <p>{prediction.predictionStartTime}</p>
        <p>{prediction.predictionEndTime}</p>
      </div>
    </div>
  )
}
