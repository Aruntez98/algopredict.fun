import Sphere from '../assets/Homepage/Sphere.png'
import DwnArrow from '../assets/Homepage/SVG_margin.png'
import Boxes from '../assets/Homepage/Component 3.png'
import list from '../assets/Homepage/Component 3 (1).png'
import Card from '../components/Card'
import img1 from '../assets/Homepage/competition-1.png'
import img2 from '../assets/Homepage/competition-2.png'
import img3 from '../assets/Homepage/competition-3.png'
import { Caller } from '../config'
import { getPrediction, getNextPredictionIndex, getUserPrediction } from '../utils'
import { useEffect, useState } from 'react'

const Homebody = ({ activeAccount }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [predictions, setPredictions] = useState([])
  const [filteredPredictions, setFilteredPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      const nextPredictionIndex = await getNextPredictionIndex(Caller);

      const predictions = await Promise.all(
        Array.from({ length: nextPredictionIndex }).map(async (_, i) => {
          const p = await getPrediction(Caller, nextPredictionIndex - 1 - i)
          if (!p) return null
          return { prediction: p, index: nextPredictionIndex - 1 - i }
        }
        )
      );

      const predictionsWithUser = await Promise.all(
        predictions.map(async (prediction) => {
          console.log(activeAccount)
          if (!activeAccount) {
            return prediction;
          }
          const user = await getUserPrediction(Caller, activeAccount.address, prediction.index);
          if (user) {
            return {
              ...prediction,
              user,
            };
          } else {
            return prediction
          }
        }
        ));

      setPredictions(predictionsWithUser)
      setLoading(false)
    }

    fetchPredictions()
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPredictions(predictions)
    } else if (selectedCategory === 'my_bets') {
      setFilteredPredictions(predictions.filter(p => p.user))
    } else {
      setFilteredPredictions(predictions.filter(p => p.prediction.category === selectedCategory))
    }
  }, [selectedCategory, predictions])

  const scrollTo = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className="hero_section" id="hero_section">
        <div className="hero_wrapper">
          <p className="hero_heading">Competitions</p>
          <div className="multichain_betting">
            <img src={Sphere} alt="" className='sphere_img' />
            <p className='multichain_heading'>Betting on Algorand is Live</p>
            <p className='multichain_summary'>Explore, Predict, and win on the hottest new markets on Algorand Network.</p>
            <button onClick={(e) => { scrollTo("bets_section") }} className='get_started_btn'>Get started</button>
          </div>
        </div>
      </section>

      <section className="bets_section" id="bets_section">
        <div className="bets_wrapper">
          <div className="top_part">
            <div className="top_first_div">
              <div className="categories_div">
                <button onClick={(_) => { setSelectedCategory("all") }} className={`category_btn ${selectedCategory == "all" && "active"}`}>All</button>
                <button onClick={(_) => { setSelectedCategory("politics") }} className={`category_btn ${selectedCategory == "politics" && "active"}`}>Politics</button>
                <button onClick={(_) => { setSelectedCategory("movies") }} className={`category_btn ${selectedCategory == "movies" && "active"}`}>Movies</button>
                <button onClick={(_) => { setSelectedCategory("airdrops") }} className={`category_btn ${selectedCategory == "airdrops" && "active"}`}>Airdrops</button>
                <button onClick={(_) => { setSelectedCategory("my_bets") }} className={`category_btn ${selectedCategory == "my_bets" && "active"}`}>My Bets</button>
              </div>
              {/* <div className="allcategories">
                <button className='all_cat_btn'>All Categories <img src={DwnArrow} alt="" /></button>
              </div> */}
            </div>
            {/* <div className="top_second_div">
              <div className="search_competetion">
                <button className='search_compet'>Search Competition</button>
              </div>
              <div className="combine_div">
                <button className='list_btn'><img src={list} alt="" /></button>
                <button className='box_btn'><img src={Boxes} alt="" /></button>
              </div>
            </div> */}
          </div>
          <div className="middle_part">
            {loading ? <p>Loading...</p> : filteredPredictions.length > 0 ? filteredPredictions.map(({ prediction, user, index }) => (
              <Card
                key={index}
                index={index}
                prediction={prediction}
                user={user}
              />
            )) : <p>No predictions found</p>}

          </div>
          {/* <div className="bottom_part">
            <button className='prev_btn'>Previous</button>
            <button className='nxt_btn'>Next</button>
          </div> */}
        </div>
      </section>
    </>
  )
}

export default Homebody
