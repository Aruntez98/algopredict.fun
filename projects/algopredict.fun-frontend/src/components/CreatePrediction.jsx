import "../css/CreatePrediction.css"
import { useState } from "react";
import { APP_ADMIN, Caller, TXN_URL, algorandClient } from "../config";
import { toast } from "react-toastify";
import { getNextPredictionIndex } from "../utils";
import * as algosdk from "algosdk";
import { useNavigate } from "react-router-dom";


export const CreatePrediction = ({ activeAccount, transactionSigner }) => {
  const [submitting, setSubmitting] = useState("");
  const [formData, setFormData] = useState({
    predictionTitle: "",
    predictionOption1: "",
    predictionOption2: "",
    predictionStartTime: "",
    predictionEndTime: "",
    predictionCategory: "movies",
    imageUrl: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      console.log("Form submitted:", formData);

      if (formData.predictionStartTime === "" || formData.predictionEndTime === "") {
        toast.error("Please select prediction start and end time");
        return;
      }

      if (new Date(formData.predictionStartTime).getTime() > new Date(formData.predictionEndTime).getTime()) {
        toast.error("Prediction start time cannot be greater than prediction end time");
        return;
      }

      if (formData.predictionTitle.length < 1) {
        toast.error("Please enter prediction title");
        return;
      }

      if (formData.predictionOption1.length < 1) {
        toast.error("Please enter prediction option 1");
        return;
      }

      if (formData.predictionOption2.length < 1) {
        toast.error("Please enter prediction option 2");
        return;
      }

      if (formData.imageUrl.length < 1) {
        toast.error("Please enter image URL");
        return;
      }

      if (activeAccount) {
        if (activeAccount.address === APP_ADMIN) {
          const predictionStartTime = new Date(formData.predictionStartTime).getTime();
          const predictionEndTime = new Date(formData.predictionEndTime).getTime();
          console.log(predictionStartTime, predictionEndTime);
          toast.info("Creating prediction...");

          const nextPredictionIndex = await getNextPredictionIndex(Caller);
          setSubmitting("Sign Transaction...");
          toast.info("Sign Transaction...");
          const encoder = new TextEncoder();
          const atc = await Caller.compose()
            .addPrediction(
              {
                question: formData.predictionTitle,
                option1Name: formData.predictionOption1,
                option2Name: formData.predictionOption2,
                startsAt: predictionStartTime,
                endsAt: predictionEndTime,
                category: formData.predictionCategory,
                image: formData.imageUrl,
              },
              { sender: { addr: activeAccount.address, signer: transactionSigner }, boxes: [{ appIndex: 0, name: algosdk.bigIntToBytes(nextPredictionIndex, 8) }], note: encoder.encode(`create-${formData.predictionCategory}`) }
            )
            .atc();

          await atc.gatherSignatures();
          setSubmitting("Submiting Transaction...");

          const newPredictionCreation = await atc.execute(algorandClient.client.algod, 3);
          console.log(newPredictionCreation);
          toast.success("Prediction created successfully", { onClick: () => window.open(`${TXN_URL}${newPredictionCreation.txIDs[0]}`) });
          setSubmitting("");
          navigate("/");

        } else {
          toast.error("You are not authorized to create a prediction");
        }
      } else {
        toast.error("Please connect your wallet to create a prediction");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating prediction");
    }
    // Add your form submission logic here
  };

  return (
    <div className="create_prediction_section">
      <div className="create_prediction_wrapper">
        <div className="create_prediction_form">
          <h2>Create Prediction</h2>
          <form onSubmit={handleSubmit}>
            <div className="form_group">
              <label htmlFor="predictionTitle">Prediction Question</label>
              <input
                type="text"
                id="predictionTitle"
                value={formData.predictionTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form_group">
              <label htmlFor="predictionOption1">Prediction Option 1</label>
              <input
                type="text"
                id="predictionOption1"
                value={formData.predictionOption1}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form_group">
              <label htmlFor="predictionOption2">Prediction Option 2</label>
              <input
                type="text"
                id="predictionOption2"
                value={formData.predictionOption2}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form_group">
              <label htmlFor="predictionStartTime">Prediction Start Time</label>
              <input
                type="datetime-local"
                id="predictionStartTime"
                value={formData.predictionStartTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form_group">
              <label htmlFor="predictionEndTime">Prediction End Time</label>
              <input
                type="datetime-local"
                id="predictionEndTime"
                value={formData.predictionEndTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form_group">
              <label htmlFor="predictionCategory">Prediction Category</label>
              <select
                id="predictionCategory"
                value={formData.predictionCategory}
                onChange={handleChange}
                required
              >
                <option value="movies">Movies</option>
                <option value="politics">Politics</option>
                <option value="airdrops">Airdrops</option>
              </select>
            </div>
            <div className="form_group">
              <label htmlFor="imageUrl">Thumnail Image URL</label>
              <input
                type="text"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form_group">
              <button type="submit" className="create_prediction_btn" disabled={submitting == "" ? false : true}
              >

                {submitting == "" ? (
                  "Create Prediction"
                ) :
                  submitting
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
