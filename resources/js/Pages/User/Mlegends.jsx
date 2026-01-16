import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Header from '../../Components/shared/header';

const MobileLegends = () => {
  // State for modal and user data
  const [showModal, setShowModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [userId, setUserId] = useState('');
  const [userBalance, setUserBalance] = useState(localStorage.getItem('balance') ?? 0);
  
  // State for packages data
  const [diamondPackages, setDiamondPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // NEW: State for tracking purchase button status
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [processingPackageId, setProcessingPackageId] = useState(null);
  
  // Fetch diamond packages data on component mount
  useEffect(() => {
    const fetchDiamondPackages = async () => {
      try {
        setLoading(true);
        const request = await fetch('https://boomuc.uz/api/mobile-legends.php?type=all');
        const response = await request.json();
        setDiamondPackages(response);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching diamond packages:", err);
        setError("Paketlarni yuklashda xatolik yuz berdi");
        setLoading(false);
      }
    };
    
    fetchDiamondPackages();
  }, []);

  // Format price for display
  const formatPrice = (price) => {
    return `${price.toLocaleString()} so'm`;
  };

  const handlePurchase = (pkg) => {
    // Prevent multiple clicks
    if (processingPurchase) {
      return;
    }
    
    setSelectedPackage(pkg);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedPackage(null);
    setUserId('');
  };
  
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };
  
  const closeErrorModal = () => {
    setShowErrorModal(false);
  };
  
  const confirmPurchase = async () => {
    if (!userId.trim()) {
      alert("Iltimos, o'yin ID raqamini kiriting!");
      return;
    }
    
    
    
    try {
      // Set processing to true to prevent multiple clicks
      setProcessingPurchase(true);
      
      // Send request to API
      const response = await fetch(`https://boomuc.uz/api/mobile-legends.php?game_id=${userId}&user_id=${user.id}&paket_id=${selectedPackage.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });      
      
      closeModal();
      const data = await response.json();
      if (data.status) {
        // Process purchase
        setUserBalance(userBalance - selectedPackage.priceValue);
        localStorage.setItem('balance', userBalance - selectedPackage.priceValue);
        // Show success modal
        setShowSuccessModal(true);
      } else {
        // Show error modal
        setShowErrorModal(true);
      }
    } catch (error) {
      // Network or other error
      console.error("Purchase error:", error);
      closeModal();
      setShowErrorModal(true);
    } finally {
      // Reset processing state regardless of outcome
      setProcessingPurchase(false);
      setProcessingPackageId(null);
    }
  };

  return (
    <>
      <Header />
      <div className="w-full px-4 py-6 bg-gray-50">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <i className="bi bi-controller text-2xl text-purple-600"></i>
            <h1 className="text-2xl font-bold text-gray-800">Mobile Legends</h1>
          </div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-2">Olmoslar xizmati</h2>
          <p className="text-gray-600 text-sm mb-3">Eng qulay narxlarda, tezkor va ishonchli olmoslar</p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full mb-6"></div>
        </div>

        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-700">Joriy balans:</div>
            <div className="font-bold text-green-600">{Number(userBalance).toLocaleString()} so'm</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg text-center mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition-colors duration-200"
            >
              Qayta urinish
            </button>
          </div>
        )}

        {/* Diamond Packages Grid - 2 columns */}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {diamondPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-lg overflow-hidden shadow-md"
              >
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-center mb-2">
                    <img 
                      src="https://png.pngtree.com/png-clipart/20211116/original/pngtree-blue-shiny-clear-diamond-realistic-illustration-png-image_6944721.png" 
                      alt="Diamond" 
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{pkg.diamonds}</div>
                  </div>
                </div>
                
                <div className="p-3 text-center">
                  <div className="mb-2">
                    <div className="text-gray-800 font-bold">{formatPrice(pkg.priceValue)}</div>
                    <div className="text-gray-400 text-xs line-through">{pkg.originalPrice}</div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (!processingPurchase) {
                        handlePurchase(pkg);
                        setProcessingPackageId(pkg.id);
                      }
                    }}
                    disabled={processingPurchase && processingPackageId === pkg.id}
                    className={`w-full py-2 px-4 ${
                      processingPurchase && processingPackageId === pkg.id 
                        ? 'bg-orange-300 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white text-sm font-medium rounded transition-colors duration-200 flex items-center justify-center`}
                  >
                    {processingPurchase && processingPackageId === pkg.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Jarayonda...
                      </>
                    ) : (
                      'Sotib olish'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How To Purchase */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Qanday sotib olish mumkin?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-800">O'yin ID raqamini kiriting</h4>
                <p className="text-sm text-gray-600">O'yin ichidagi ID raqamingizni aniq kiriting</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-800">To'lov usulini tanlang</h4>
                <p className="text-sm text-gray-600">Click, Payme, UZCARD yoki boshqa to'lov usullaridan foydalaning</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3 flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Buyurtmangizni kuting</h4>
                <p className="text-sm text-gray-600">Olmoslar 5 daqiqa ichida hisobingizga qo'shiladi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Modal */}
        {showModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Olmos xarid qilish</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={processingPurchase}
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Paket:</span>
                  <span className="font-bold">{selectedPackage.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Narxi:</span>
                  <span className="font-bold text-blue-600">{formatPrice(selectedPackage.priceValue)}</span>
                </div>
              </div>
              

              {Number(userBalance) < selectedPackage.priceValue ? (
                <div className="mb-4 p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-red-600 mb-2">Hisobingizda yetarli mablag' yo'q!</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Joriy balans: <span className="font-bold">{Number(userBalance).toLocaleString()} so'm</span><br/>
                    Kerak: <span className="font-bold">{selectedPackage.priceValue.toLocaleString()} so'm</span>
                  </p>
                  <button
                    onClick={() => window.location.href = "/?route=deposit"}
                    className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors duration-200"
                  >
                    Hisobni to'ldirish
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      O'yin ID raqamingiz:
                    </label>
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Masalan: 12345678"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      disabled={processingPurchase}
                      required
                    />
                  </div>
                  <button
                    onClick={confirmPurchase}
                    disabled={processingPurchase}
                    className={`w-full py-2 px-4 ${
                      processingPurchase 
                        ? 'bg-orange-300 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white text-sm font-medium rounded transition-colors duration-200 flex items-center justify-center`}
                  >
                    {processingPurchase ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Jarayonda...
                      </>
                    ) : (
                      'Tasdiqlash'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-5 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Xaridingiz muvaffaqiyatli yakunlandi!</h3>
              
              <p className="text-gray-600 mb-6">
                Olmoslar 24 soat ichida hisobingizga tushiriladi. Xaridingiz uchun rahmat!
              </p>
              
              <button
                onClick={closeSuccessModal}
                className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded transition-colors duration-200"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
        
        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-5 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Xatolik yuz berdi!</h3>
              
              <p className="text-gray-600 mb-6">
                Xarid jarayonida xatolik yuz berdi. Iltimos, qayta urinib ko'ring yoki yordam uchun bizga murojaat qiling.
              </p>
              
              <button
                onClick={closeErrorModal}
                className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors duration-200"
              >
                Yopish
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileLegends;