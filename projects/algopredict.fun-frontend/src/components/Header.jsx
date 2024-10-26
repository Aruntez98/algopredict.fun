
const Header = () => {
  return (
    <>
        <section className="header_section" id="header_section">
            <div className="sticky_nav"></div>
            <div className="header_wrapper">
                <div className="first_wrap">
                    <p className="cmpny_name">Algopredict.fun</p>
                    <p className="menu_item_profile">Profile</p>
                    <p className="menu_item_events">Events</p>
                </div>
                <div className="second_wrap">
                    <button className="connect_wallet_btn">Connect Wallet</button>
                </div>
            </div>
        </section>
    </>
  )
}

export default Header
