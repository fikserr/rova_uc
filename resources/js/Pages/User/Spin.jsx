import { useState, useRef, useEffect } from 'react';
import Header from '../../Components/shared/header';

export default function PrizeWheel() {
  // Define the prizes on the wheel
  const prizes = [
    { value: '10 000', color: '#3b82f6' },
    { value: 'ZERO', color: '#38bdf8' },
    { value: '2000', color: '#7dd3fc' },
    { value: '500', color: '#0ea5e9' },
    { value: '1000', color: '#2563eb' },
    { value: '5000', color: '#60a5fa' },
    { value: '200', color: '#93c5fd' },
    { value: 'JACKPOT', color: '#a855f7' },
    { value: '50', color: '#d946ef' },
    { value: '5000', color: '#ec4899' },
    { value: '1500', color: '#f472b6' },
    { value: '1000', color: '#f43f5e' },
  ];
  
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [spinButtonDisabled, setSpinButtonDisabled] = useState(false);
  const [showWinnerAlert, setShowWinnerAlert] = useState(false);
  const [paddingTop, setPaddingTop] = useState('25%');
  const spinTimeRef = useRef(null);
  
  // Effect to handle responsive padding based on screen height
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      if(height > 720 && height < 929){
        setPaddingTop('25%');
      }else if(height > 930){
        setPaddingTop('30%');
      }else{
        setPaddingTop('15%');
      }
    };
    
    // Initial setting
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (spinTimeRef.current) {
        clearTimeout(spinTimeRef.current);
      }
    };
  }, []);

  const spinWheel = () => {
    if (spinning) return;
    
    setSpinButtonDisabled(true);
    setWinner(null);
    setShowWinnerAlert(false);
    setSpinning(true);
    
    // Random number of complete rotations plus a random position
    const spinTime = 5000 + Math.random() * 3000; // 5-8 seconds
    const totalRotation = rotation + (3600 + Math.floor(Math.random() * 360));
    
    spinTimeRef.current = setTimeout(() => {
      setSpinning(false);
      
      // Calculate winner based on final position
      const degreePerSegment = 360 / prizes.length;
      const normalizedRotation = totalRotation % 360;
      const winningIndex = prizes.length - 1 - Math.floor(normalizedRotation / degreePerSegment);
      const adjustedIndex = winningIndex % prizes.length;
      
      setWinner(prizes[adjustedIndex].value);
      setShowWinnerAlert(true);
      setSpinButtonDisabled(false);
    }, spinTime);
    
    setRotation(totalRotation);
  };

  // Calculate segments for SVG rendering
  const segments = prizes.map((prize, index) => {
    const angle = 360 / prizes.length;
    const startAngle = index * angle;
    const endAngle = (index + 1) * angle;
    
    // Convert angles to radians
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate points
    const x1 = 150 + 150 * Math.cos(startRad);
    const y1 = 150 + 150 * Math.sin(startRad);
    const x2 = 150 + 150 * Math.cos(endRad);
    const y2 = 150 + 150 * Math.sin(endRad);
    
    // Path for segment
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M 150 150 L ${x1} ${y1} A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    // Calculate text position (halfway between center and edge)
    const textAngle = startAngle + angle / 2;
    const textRad = (textAngle - 90) * Math.PI / 180;
    const textX = 150 + 90 * Math.cos(textRad);
    const textY = 150 + 90 * Math.sin(textRad);
    
    return {
      path,
      color: prize.color,
      value: prize.value,
      textX,
      textY,
      textAngle
    };
  });

  return (
    <>
      <Header />
      
    <div className="flex flex-col items-center min-h-screen bg-white overflow-hidden" style={{ minHeight: '90vh', paddingTop: paddingTop }}>
      <div className="flex flex-col justify-center w-full max-w-full px-4 py-4 relative">
        <div className="relative w-full aspect-square max-w-xs mx-auto">
          {/* Top indicator triangle marker - with corrected direction */}
          <div className="absolute w-8 h-10 top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
            <div className="w-0 h-0 
                           border-l-[16px] border-r-[16px] border-t-[28px] 
                           border-l-transparent border-r-transparent border-t-red-600
                           mx-auto filter drop-shadow-lg">
            </div>
          </div>
          
          {/* Wheel Container with Shadow */}
          <div className="absolute inset-0 rounded-full shadow-xl flex items-start justify-center">
            {/* SVG Wheel */}
            <svg 
              width="300" 
              height="300" 
              viewBox="0 0 300 300" 
              className="w-full h-full"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? `transform ${spinning ? '5s' : '0s'} cubic-bezier(0.2, 0.8, 0.3, 1)` : 'none'
              }}
            >
              {/* Wheel Segments */}
              {segments.map((segment, index) => (
                <g key={index}>
                  <path 
                    d={segment.path} 
                    fill={segment.color}
                    stroke="#ffffff" 
                    strokeWidth="2"
                  />
                  <text
                    x={segment.textX}
                    y={segment.textY}
                    fill="white"
                    fontWeight="bold"
                    fontSize="16"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${90 + segment.textAngle}, ${segment.textX}, ${segment.textY})`}
                    style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.5))' }}
                  >
                    {segment.value}
                  </text>
                </g>
              ))}
              
              {/* Central Circle */}
              <circle cx="150" cy="150" r="20" fill="#F1BE48" stroke="#E9A800" strokeWidth="4" />
            </svg>
          </div>
          
          {/* Outer blue border only */}
          <div className="absolute inset-0 rounded-full border-8 border-blue-600 pointer-events-none"></div>
        </div>
        
        <div className="mt-8 flex flex-col items-center w-full">
          <button
            onClick={spinWheel}
            disabled={spinButtonDisabled}
            className={`px-8 py-4 rounded-full text-xl font-bold text-white ${spinButtonDisabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors shadow-lg w-full max-w-xs`}
          >
            {spinning ? 'Spinning...' : 'SPIN'}
          </button>
        </div>
        
        {/* Winner Alert Modal */}
        {showWinnerAlert && winner && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs transform transition-all animate-bounce-once">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Congratulations!</h3>
                <div className="mt-2 text-3xl font-bold text-blue-600">{winner}</div>
                <p className="mt-1 text-sm text-gray-500">You won this prize!</p>
                <button 
                  onClick={() => setShowWinnerAlert(false)}
                  className="mt-6 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors w-full"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}