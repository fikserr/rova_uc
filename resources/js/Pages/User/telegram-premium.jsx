import React, { useState } from 'react';
import Header from '../../Components/shared/header';

const TelegramPremium = () => {
  const [selectedPlan, setSelectedPlan] = useState('3-month');

  const premiumPlans = [
    {
      id: '1-month',
      duration: '1 Oy',
      price: '56,000',
      features: [
        'Reklama yo\'q',
        '4 GB yuklash',
        'Keng imkoniyatlar',
        'Maxsus stickers'
      ],
      popular: false,
      saveAmount: null,
      icon: 'bi-star'
    },
    {
      id: '3-month',
      duration: '3 Oy',
      price: '199,000',
      features: [
        'Reklama yo\'q',
        '4 GB yuklash',
        'Keng imkoniyatlar',
        'Maxsus stickers',
        'Voice-to-Text'
      ],
      popular: true,
      saveAmount: '15%',
      icon: 'bi-stars'
    },
    {
      id: '6-month',
      duration: '6 Oy',
      price: '248,000',
      features: [
        'Reklama yo\'q',
        '4 GB yuklash',
        'Keng imkoniyatlar',
        'Maxsus stickers',
        'Voice-to-Text',
        'Premium profil'
      ],
      popular: false,
      saveAmount: '25%',
      icon: 'bi-gem'
    },
    {
      id: '1-year',
      duration: '1 Yil',
      price: '369,000',
      features: [
        'Reklama yo\'q',
        '4 GB yuklash',
        'Keng imkoniyatlar',
        'Maxsus stickers',
        'Voice-to-Text',
        'Premium profil',
        'Cheksiz saqlash'
      ],
      popular: false,
      saveAmount: '45%',
      icon: 'bi-gem-fill'
    }
  ];

  const handleSubscribe = (planId) => {
    console.log(`Subscribing to plan: ${planId}`);
    setSelectedPlan(planId);
    // Implementation for subscription logic
  };

  return (
    <>
      <Header />
      <div className="w-full px-4 py-6 bg-gray-50">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <div className="bg-blue-500 rounded-xl p-3">
              <i className="bi bi-telegram text-3xl text-white"></i>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Telegram Premium</h1>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 font-bold text-lg mb-3">
            Telegramning barcha imkoniyatlaridan foydalaning
          </p>
          <p className="text-gray-600 text-sm mb-3 max-w-md mx-auto">
            Telegram Premium bilan ko'proq imkoniyatlar, yuqori sifat va tezlik orqali telegramdan foydalaning.
          </p>
        </div>

        {/* Plan Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {premiumPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                selectedPlan === plan.id 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    TOP TANLOV
                  </div>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{plan.duration}</h3>
                    {plan.saveAmount && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        {plan.saveAmount} tejamkor
                      </span>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'text-blue-500' : 'text-blue-400'
                  }`}>
                    <i className={`bi ${plan.icon} text-xl`}></i>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="ml-1 text-gray-500 text-sm">UZS</span>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <i className="bi bi-check-circle-fill text-green-500 mr-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-2.5 px-4 rounded-lg transition-all duration-300 font-medium flex items-center justify-center ${
                    selectedPlan === plan.id 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <i className="bi bi-lightning-charge-fill mr-2"></i>
                  Faollashtirish
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Premium afzalliklari</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-500 mb-2">
                <i className="bi bi-cloud-upload text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 text-center">4GB yuklash</h3>
              <p className="text-xs text-gray-600 text-center">Katta hajmdagi fayllarni yuklash</p>
            </div>
            
            <div className="flex flex-col items-center p-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
                <i className="bi bi-speedometer2 text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 text-center">Yuqori tezlik</h3>
              <p className="text-xs text-gray-600 text-center">Tezroq yuklash va ko'chirish</p>
            </div>
            
            <div className="flex flex-col items-center p-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-2">
                <i className="bi bi-badge-ad text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 text-center">Reklamasiz</h3>
              <p className="text-xs text-gray-600 text-center">Reklamalar ko'rsatilmaydi</p>
            </div>
            
            <div className="flex flex-col items-center p-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-2">
                <i className="bi bi-emoji-smile text-xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 text-center">Exclusive stickers</h3>
              <p className="text-xs text-gray-600 text-center">Maxsus stickerlar to'plami</p>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ko'p so'raladigan savollar</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">Premium hisobni qanday faollashtirish mumkin?</h3>
              <p className="text-sm text-gray-600">To'lov qilgandan so'ng, sizning hisobingiz avtomatik tarzda faollashtiriladi. Faollashtirish 5 daqiqagacha davom etishi mumkin.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800">To'lov usullari qanday?</h3>
              <p className="text-sm text-gray-600">UZCARD, HUMO, Click, Payme va boshqa qulay to'lov tizimlari orqali to'lovni amalga oshiring.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800">Obunani bekor qilish mumkinmi?</h3>
              <p className="text-sm text-gray-600">Ha, istalgan vaqtda obunani bekor qilishingiz mumkin, ammo to'langan summa qaytarilmaydi.</p>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
};

export default TelegramPremium;