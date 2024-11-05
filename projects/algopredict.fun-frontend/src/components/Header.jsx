import { NavLink } from 'react-router-dom';
import ConnectWalletModal from './ConnectWalletModal';
import { useEffect, useState } from 'react';
import { APP_ADMIN } from '../config';

export const Header = ({
  wallets,
  activeAccount,
  transactionSigner,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.address === APP_ADMIN) {
        setIsAdmin(true);
      }
    }
  }, [activeAccount])

  return (
    <>
      <section className="header_section" id="header_section">
        <div className="sticky_nav"></div>
        <div className="header_wrapper">
          <div className="first_wrap">
            <NavLink to="/" className="cmpny_name">Algopredict.fun</NavLink>
            {/* <NavLink to="/profile" className="menu_item_profile">Profile</NavLink> */}
            <NavLink to="/" className="menu_item_events">Events</NavLink>
            {isAdmin && <NavLink to="/create-prediction" className="menu_item_events">Create Prediction</NavLink>}
          </div>
          <div className="second_wrap">
            <button onClick={() => setIsModalOpen(true)} className="connect_wallet_btn">{activeAccount ? `Connected as ${activeAccount.address.slice(0, 3)}...${activeAccount.address.slice(-3)}` : "Connect Wallet"}</button>
          </div>
        </div>
      </section>
      <ConnectWalletModal wallets={wallets} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default Header
