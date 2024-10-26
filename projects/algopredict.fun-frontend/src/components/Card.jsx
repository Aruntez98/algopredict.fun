import people from '../assets/Homepage/people.png'
import dollar from '../assets/Homepage/dollar.png'
import trophy from '../assets/Homepage/trophy.png'
import plus from '../assets/Homepage/plus.png'


const Card = (props) => {
  return (
    <>
        <div className="card_section">
            <div className="card_wrapper">
                <div className="bet_image_div">
                    <img src={props.image} alt="" />
                    <p className="card_headline">{props.headline}</p>
                </div>
                <div className="bet_details_div">
                    <div className="people_div">
                        <img src={people} alt="" />
                        <p className='people_count'>{props.people}</p>
                    </div>
                    <div className="amount_div">
                        <img src={dollar} alt="" />
                        <p className='dollar_amount'>{props.amount}</p>
                    </div>
                    <div className="trophy_div">
                        <img src={trophy} alt="" />
                        <p className='trophy_count'>{props.trophy}</p>
                    </div>
                </div>
                <div className="starts_predic_div">
                    <button className='starts_in_btn'>Starts in : <span className='starts_inn'>{props.startsin}</span></button>
                    <button className='predict_btn'>Predict <img src={plus} alt="" /></button>
                </div>
            </div>
        </div>
    </>
  )
}

export default Card
