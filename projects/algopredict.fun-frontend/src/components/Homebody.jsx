import Sphere from '../assets/Homepage/Sphere.png'
import DwnArrow from '../assets/Homepage/SVG_margin.png'
import Boxes from '../assets/Homepage/Component 3.png'
import list from '../assets/Homepage/Component 3 (1).png'
import Card from '../components/Card'
import img1 from '../assets/Homepage/competition-1.png'
import img2 from '../assets/Homepage/competition-2.png'
import img3 from '../assets/Homepage/competition-3.png'



const Homebody = () => {
  return (
    <>
      <section className="hero_section" id="hero_section">
        <div className="hero_wrapper">
          <p className="hero_heading">Competitions</p>
          <div className="multichain_betting">
            <img src={Sphere} alt="" className='sphere_img' />
            <p className='multichain_heading'>Betting on Algorand is Live</p>
            <p className='multichain_summary'>Explore, Predict, and win on the hottest new markets on Algorand Network.</p>
            <button className='get_started_btn'>Get started</button>
          </div>
        </div>
      </section>

      <section className="bets_section" id="bets_section">
        <div className="bets_wrapper">
          <div className="top_part">
            <div className="top_first_div">
              <div className="categories_div">
                <button className='category_btn'>All</button>
                <button className='category_btn'>Politics</button>
                <button className='category_btn'>Movies</button>
                <button className='category_btn'>Airdrops</button>
                <button className='category_btn'>My Bets</button>
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
            <Card
              image={img1}
              headline='Who will win next US election 2024?'
              people='1,00,683'
              amount='N/A'
              trophy='$5.06M'
              startsin='1W 1D 16H'
            />

            <Card
              image={img2}
              headline='Who will win next US election 2024?'
              people='1,00,683'
              amount='N/A'
              trophy='$5.06M'
              startsin='1W 1D 16H'
            />

            <Card
              image={img3}
              headline='Who will win next US election 2024?'
              people='1,00,683'
              amount='N/A'
              trophy='$5.06M'
              startsin='1W 1D 16H'
            />

            <Card
              image={img3}
              headline='Who will win next US election 2024?'
              people='1,00,683'
              amount='N/A'
              trophy='$5.06M'
              startsin='1W 1D 16H'
            />

            <Card
              image={img3}
              headline='Who will win next US election 2024?'
              people='1,00,683'
              amount='N/A'
              trophy='$5.06M'
              startsin='1W 1D 16H'
            />

            <Card
              image={img3}
              headline='Who will win next US election 2024?'
              people='1,00,683'
              amount='N/A'
              trophy='$5.06M'
              startsin='1W 1D 16H'
            />
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
