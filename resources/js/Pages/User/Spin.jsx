import { Gift, Lock, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";
import UserLayout from "@/Components/Layout/UserLayout";


const prizes = [
    { id: "1", label: "$10", color: "#3B82F6", value: "10" },
    { id: "2", label: "$200", color: "#EF4444", value: "200" },
    { id: "3", label: "$15", color: "#EC4899", value: "15" },
    { id: "4", label: "$100", color: "#D946EF", value: "100" },
    { id: "5", label: "$175", color: "#A855F7", value: "175" },
    { id: "6", label: "JACKPOT", color: "#8B5CF6", value: "500" },
    { id: "7", label: "$20", color: "#6366F1", value: "20" },
    { id: "8", label: "$5", color: "#3B82F6", value: "5" },
    { id: "9", label: "$1", color: "#0EA5E9", value: "1" },
    { id: "10", label: "$50", color: "#06B6D4", value: "50" },
    { id: "11", label: "ZERO", color: "#14B8A6", value: "0" },
    { id: "12", label: "$2", color: "#10B981", value: "2" },
];

 function Spin() {
    const [spins, setSpins] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [lastPrize, setLastPrize] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const handleSpin = () => {
        if (spins <= 0 || isSpinning) return;

        setIsSpinning(true);
        setShowResult(false);
        setSpins(spins - 1);

        const randomIndex = Math.floor(Math.random() * prizes.length);
        const selectedPrize = prizes[randomIndex];

        const segmentAngle = 360 / prizes.length;
        const targetRotation =
            360 * 5 + (360 - randomIndex * segmentAngle - segmentAngle / 2);
        const newRotation = rotation + targetRotation;

        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setLastPrize(selectedPrize);
            setShowResult(true);
        }, 4000);
    };

    return (
        <div className="min-h-[calc(100vh-140px)] bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-6 pb-24 lg:pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 lg:mb-10">
                    <div className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full mb-4 text-sm font-semibold shadow-lg">
                        <Sparkles className="size-4" />
                        <span>Omadingizni sinab ko'ring!</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Ruletka
                    </h1>
                    <p className="text-slate-600 text-base sm:text-lg">
                        Aylantiring va sovg'alarni yutib oling
                    </p>
                </div>

                {/* Available Spins */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 lg:mb-8 border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl">
                                <Trophy className="size-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Mavjud aylanishlar
                                </h3>
                                <p className="text-sm text-slate-600">
                                    Xarid yoki vazifa bajarish orqali oling
                                </p>
                            </div>
                        </div>
                        <div className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {spins}
                        </div>
                    </div>
                </div>

                {/* Wheel */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 mb-6 border border-slate-100">
                    <div className="relative max-w-md mx-auto">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-blue-600 drop-shadow-lg" />
                        </div>
                        <div className="relative aspect-square">
                            <svg
                                viewBox="0 0 400 400"
                                className="w-full h-full drop-shadow-2xl"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning
                                        ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                                        : "none",
                                }}
                            >
                                <circle
                                    cx="200"
                                    cy="200"
                                    r="195"
                                    fill="#2563EB"
                                />
                                {prizes.map((prize, index) => {
                                    const segmentAngle = 360 / prizes.length;
                                    const startAngle =
                                        index * segmentAngle - 90;
                                    const endAngle = startAngle + segmentAngle;
                                    const startRad =
                                        (startAngle * Math.PI) / 180;
                                    const endRad = (endAngle * Math.PI) / 180;
                                    const x1 = 200 + 185 * Math.cos(startRad);
                                    const y1 = 200 + 185 * Math.sin(startRad);
                                    const x2 = 200 + 185 * Math.cos(endRad);
                                    const y2 = 200 + 185 * Math.sin(endRad);
                                    const midAngle =
                                        (startAngle + endAngle) / 2;
                                    const midRad = (midAngle * Math.PI) / 180;
                                    const textX = 200 + 120 * Math.cos(midRad);
                                    const textY = 200 + 120 * Math.sin(midRad);

                                    return (
                                        <g key={prize.id}>
                                            <path
                                                d={`M 200 200 L ${x1} ${y1} A 185 185 0 0 1 ${x2} ${y2} Z`}
                                                fill={prize.color}
                                                stroke="white"
                                                strokeWidth="2"
                                            />
                                            <text
                                                x={textX}
                                                y={textY}
                                                fill="white"
                                                fontSize={
                                                    prize.label === "JACKPOT" ||
                                                    prize.label === "ZERO"
                                                        ? 16
                                                        : 20
                                                }
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                                            >
                                                {prize.label}
                                            </text>
                                        </g>
                                    );
                                })}
                                <circle
                                    cx="200"
                                    cy="200"
                                    r="40"
                                    fill="#EAB308"
                                />
                                <circle
                                    cx="200"
                                    cy="200"
                                    r="35"
                                    fill="#FCD34D"
                                />
                            </svg>
                        </div>

                        {/* Spin Button */}
                        <div className="mt-8">
                            <button
                                onClick={handleSpin}
                                disabled={spins <= 0 || isSpinning}
                                className="w-full h-16 text-xl font-bold rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed"
                            >
                                {isSpinning ? (
                                    <>
                                        <div className="animate-spin size-6 border-3 border-white border-t-transparent rounded-full mr-3" />
                                        Aylanmoqda...
                                    </>
                                ) : spins <= 0 ? (
                                    <>
                                        <Lock className="size-6 mr-2" />
                                        Aylanish yo'q
                                    </>
                                ) : (
                                    "SPIN"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result Modal */}
                {showResult && lastPrize && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
                                    <Gift className="size-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2 text-slate-900">
                                    Tabriklaymiz! 🎉
                                </h2>
                                <p className="text-slate-600 mb-6">
                                    Siz yutib oldingiz:
                                </p>
                                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6">
                                    <div className="text-5xl font-bold text-white">
                                        {lastPrize.label}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowResult(false)}
                                    className="w-full h-12 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    Yopish
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* How to Get Spins */}
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                        Aylanishlarni qanday olish mumkin?
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                            <div className="text-4xl mb-3">🎮</div>
                            <h4 className="font-semibold mb-2">Xarid qiling</h4>
                            <p className="text-sm text-blue-100">
                                O'yin valyutasi yoki Telegram xizmati xarid
                                qiling
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                            <div className="text-4xl mb-3">⭐</div>
                            <h4 className="font-semibold mb-2">
                                Telegram Stars
                            </h4>
                            <p className="text-sm text-blue-100">
                                Telegram Stars yoki Premium sotib oling
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                            <div className="text-4xl mb-3">✅</div>
                            <h4 className="font-semibold mb-2">Vazifalar</h4>
                            <p className="text-sm text-blue-100">
                                Vazifalarni bajarib bepul aylanishlar oling
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
Spin.layout = (page) => <UserLayout>{page}</UserLayout>;

export default Spin;
