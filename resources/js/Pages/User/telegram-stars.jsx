import React from 'react';
import { ArrowRight, Star, Check } from 'lucide-react';
import Header from '../../Components/shared/header';

const TelegramStars = () => {
  const starPackages = [
    {
      id: 'basic',
      name: 'Boshlang\'ich',
      stars: 25,
      price: '15,000 so\'m',
      features: ['Instant delivery', 'Secure payment', '24/7 Support'],
      popular: false,
      color: 'blue'
    },
    {
      id: 'standard',
      name: 'Standart',
      stars: 100,
      price: '49,000 so\'m',
      features: ['Instant delivery', 'Secure payment', '24/7 Support', '10% bonus'],
      popular: true,
      color: 'purple'
    },
    {
      id: 'premium',
      name: 'Premium',
      stars: 250,
      price: '99,000 so\'m',
      features: ['Instant delivery', 'Secure payment', '24/7 Support', '15% bonus'],
      popular: false,
      color: 'indigo'
    },
    {
      id: 'vip',
      name: 'VIP',
      stars: 500,
      price: '185,000 so\'m',
      features: ['Instant delivery', 'Secure payment', '24/7 Support', '20% bonus'],
      popular: false,
      color: 'amber'
    }
  ];

  return (
    <>
      <Header />
      <div className="w-full px-4 py-6 bg-gray-50">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Telegram Stars</h1>
          <div className="flex items-center justify-center mt-2 mb-4">
            <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
            <Star className="text-yellow-400 w-6 h-6 fill-yellow-400 mx-1" />
            <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
          </div>
          <p className="text-gray-600 text-sm mb-4">Telegram Stars - eng qulay narxlarda, tezkor yetkazib berish bilan!</p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {starPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative rounded-xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl ${pkg.popular ? 'border-2 border-purple-500' : 'border border-gray-200'}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-purple-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    ENG OMMABOP
                  </div>
                </div>
              )}
              
              <div className={`p-5 ${pkg.popular ? 'bg-gradient-to-br from-purple-50 to-blue-50' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${pkg.color === 'purple' ? 'bg-purple-500' : pkg.color === 'blue' ? 'bg-blue-500' : pkg.color === 'indigo' ? 'bg-indigo-500' : 'bg-amber-500'} text-white`}>
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                </div>
                
                <div className="flex items-end mb-5">
                  <span className="text-3xl font-bold text-gray-900">{pkg.stars}</span>
                  <span className="ml-2 text-gray-600 font-medium"> Stars</span>
                </div>
                
                <div className="mb-5">
                  <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                </div>
                
                <ul className="mb-5 space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center ${pkg.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' : pkg.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : pkg.color === 'indigo' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-amber-500 hover:bg-amber-600'} transition-colors duration-200`}>
                  Sotib olish
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promotional Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 text-white text-center mb-6">
          <h3 className="text-xl font-bold mb-2">Maxsus Taklif!</h3>
          <p className="mb-3">Hozir buyurtma bering va 10% chegirma oling!</p>
          <button className="bg-white text-purple-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Chegirmani olish
          </button>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tez-tez so'raladigan savollar</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Telegram Stars nima?</h4>
              <p className="text-sm text-gray-600">Telegram Stars - bu Telegram'da yulduzlar sotib olish uchun xizmat. Yulduzlar kanallarni qo'llab-quvvatlash uchun ishlatiladi.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Yulduzlar qanday yetkazib beriladi?</h4>
              <p className="text-sm text-gray-600">To'lov qilgandan so'ng darhol Telegram hisobingizga yulduzlar qo'shiladi.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-1">To'lov usullari?</h4>
              <p className="text-sm text-gray-600">Payme, Click, UZCARD, HUMO va boshqa to'lov tizimlari orqali to'lashingiz mumkin.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TelegramStars;