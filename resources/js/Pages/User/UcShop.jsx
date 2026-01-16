import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Header from "../../Components/shared/header";

const cardVariants = {
  hidden: (index) => ({
    x: index % 2 === 0 ? -100 : 100,
    opacity: 0,
  }),
  visible: (index) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut", delay: index * 0.1 },
  }),
};

const popularTagVariants = {
  animate: {
    backgroundColor: ["#FFD700", "#FF6347", "#FF4500", "#FFD700"], // Oltin -> Qizil -> Yorqin apelsin -> Oltin
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

const UcShop = () => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

 
  // "Sotib olish" tugmasi bosilganda ishlaydi
  const handleBuyClick = (card) => {
    setSelectedItem(card);
    setModalOpen(true);
  };

  return (
    <>
      <Header />
      <div className="shop-container">
        <motion.div className="shop-cards-grid" initial="hidden" animate="visible">
          {data.map((card, index) => (
            <motion.div
              className="shop-card"
              key={card.id}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              animate="visible"
            >
              {card.popular && (
                <motion.div className="shop-popular-tag" variants={popularTagVariants} animate="animate">
                  Mashhur
                </motion.div>
              )}
              <div className="shop-card-img">
                <img src={card.image} alt="Currency" />
              </div>
              <div className="shop-card-content">
                <div className="shop-currency-amount">
                  <img
                    src="https://cdn.midasbuy.com/images/uc-small.bc30c95b.png"
                    alt="Currency icon"
                  />
                  {card.mainAmount} {card.bonusAmount > 0 ? "+" + card.bonusAmount : ""}
                </div>
                {card.bonusAmount > 0 && <div className="shop-bonus">+{card.bonusAmount}</div>}
                <div className="shop-price">{card.price} {card.currency}</div>
                <div className="shop-old-price">{card.oldPrice} {card.currency}</div>
                <button 
                  className="shop-buy-btn"
                  onClick={() => handleBuyClick(card)} // "Sotib olish" tugmasi uchun funksiya
                >
                  Sotib olish
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* To'lov Modali - user obyektini to'liqligicha uzatish */}
      {/* <PaymentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        item={selectedItem || {}}
        user={user} // To'liq user obyektini uzatamiz
      /> */}
      <br />
    </>
  );
};

export default UcShop;