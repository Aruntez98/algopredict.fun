import Homepage from './pages/Homepage'
import './App.css'
import { HashRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import { useWallet } from '@txnlab/use-wallet-react';
import { Header } from './components/Header';
const App = () => {
  const { wallets, activeWallet, activeAccount, transactionSigner } = useWallet();

  console.log(wallets)
  return (
    <>
      <>
        <Router>
          <Header
            wallets={wallets}
            transactionSigner={transactionSigner}
            activeAccount={activeAccount}
          />
          <Routes>
            <Route path="/" element={<Homepage />} />

          </Routes>
        </Router>
      </>
    </>
  )
}

export default App
