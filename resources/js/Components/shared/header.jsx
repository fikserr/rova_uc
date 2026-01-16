import { useState, useEffect } from 'react';


const Header = () => {
  const [balance, setBalance] = useState(0);

  return (
    <div className="game-header1">
      <div className="user-info1">
        <img src="https://www.freeiconspng.com/uploads/pubg-circle-battlegrounds-photo-23.png" alt="Profile" />
        <span>Abdulloh</span>
      </div>
      <div className="balance-info1">
        <span><b>{balance}</b> so'm</span>
      </div>
    </div>
  );
};

export default Header;