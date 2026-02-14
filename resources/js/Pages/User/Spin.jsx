
import { Head, usePage } from "@inertiajs/react";
import { Gift, Lock, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";

function Spin() {
    const pageProps = usePage().props;
    const initialSpins = 5;
    const [spins, setSpins] = useState(initialSpins);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [lastPrize, setLastPrize] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const { sectors: sectorsRaw } = pageProps;

    // Filter active sectors
    const activeSectors = Array.isArray(sectorsRaw)
        ? sectorsRaw.filter((s) => Number(s.is_active) === 1)
        : [];

    // Map sectors for wheel
    const sectors = activeSectors.map((s, i) => {
        const hue = Math.round((i * 360) / Math.max(activeSectors.length, 1));
        const color = `hsl(${hue} 75% 45%)`;
        return {
            id: String(s.id),
            label: s.title || `${s.reward_type} ${s.reward_value}`,
            color,
            value: s.reward_value,
            reward_type: s.reward_type,
            probability: Number(s.probability ?? 0),
            raw: s,
        };
    });

    // Check if prize is UC
    const isBlockedPrize = (sector) => {
        return (
            typeof sector.label === "string" &&
            sector.label.toLowerCase().includes("uc")
        );
    };

    // Weighted random picker
    const pickWeightedIndex = (arr) => {
        if (!arr || arr.length === 0) return -1;
        const probs = arr.map((a) =>
            Number(a.probability) > 0 ? Number(a.probability) : 0,
        );
        const total = probs.reduce((s, p) => s + p, 0);
        if (total <= 0) return Math.floor(Math.random() * arr.length);

        const r = Math.random() * total;
        let acc = 0;
        for (let i = 0; i < probs.length; i++) {
            acc += probs[i];
            if (r <= acc) return i;
        }
        return arr.length - 1;
    };

    const getLandedIndexFromRotation = (rot, sectorCount) => {
        if (sectorCount === 0) return -1;
        const seg = 360 / sectorCount;
        const normalizedNegR = (360 - (rot % 360) + 360) % 360;
        const raw = (normalizedNegR - seg / 2 + 360) % 360;
        const idx = Math.floor(raw / seg) % sectorCount;
        return idx;
    };

    const handleSpin = () => {
        if (spins <= 0 || isSpinning || sectors.length === 0) return;

        setIsSpinning(true);
        setShowResult(false);
        setSpins((p) => p - 1);

        // Pick weighted index
        let chosenIndex = pickWeightedIndex(sectors);
        let chosenSector = sectors[chosenIndex];

        // If UC, pick next allowed sector
        if (isBlockedPrize(chosenSector)) {
            const allowedIndex = sectors.findIndex((s) => !isBlockedPrize(s));
            chosenIndex = allowedIndex >= 0 ? allowedIndex : chosenIndex;
            chosenSector = sectors[chosenIndex];
        }

        // Calculate rotation
        const segmentAngle = 360 / sectors.length;
        const rounds = 5;
        const alignPart =
            (360 - chosenIndex * segmentAngle - segmentAngle / 2 + 360) % 360;
        const targetRotation = rounds * 360 + alignPart;
        const newRotation = rotation + targetRotation;

        setRotation(targetRotation);

        // Show result after animation
        setTimeout(() => {
            setIsSpinning(false);
            const landedIndex = getLandedIndexFromRotation(
                targetRotation,
                sectors.length,
            );
            const landed = sectors[landedIndex] ?? sectors[chosenIndex];
            setLastPrize(landed);
            setShowResult(true);
            setTimeout(() => {
                setRotation(0);
            }, 300);
        }, 4000);
    };

    return (
        <div
            className="min-h-[calc(100vh-140px)] bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50
                        dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
                        px-4 py-6 pb-24 lg:pb-8"
        >
            <Head title="Ruletka" />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 lg:mb-10">
                    <div className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full mb-4 text-sm font-semibold shadow-lg">
                        <Sparkles className="size-4" />
                        <span>Omadingizni sinab ko'ring!</span>
                    </div>
                    <h1
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3
                                   bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent
                                   dark:text-slate-100"
                    >
                        Ruletka
                    </h1>
                    <p className="text-slate-600 text-base sm:text-lg dark:text-slate-400">
                        Aylantiring va sovg'alarni yutib oling
                    </p>
                </div>

                {/* Available Spins */}
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-6 lg:mb-8 border border-slate-100
                                dark:bg-slate-800/80 dark:border-white/10 dark:shadow-none"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl">
                                <Trophy className="size-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Mavjud aylanishlar
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
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
                <div
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 mb-6 border border-slate-100
                                dark:bg-slate-800/80 dark:border-white/10 dark:shadow-none"
                >
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
                                {sectors.map((prize, index) => {
                                    const segmentAngle = 360 / sectors.length;
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
                                    const fontSize =
                                        prize.label.length > 12 ? 12 : 16;

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
                                                fontSize={fontSize}
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
                                disabled={
                                    spins <= 0 ||
                                    isSpinning ||
                                    sectors.length === 0
                                }
                                className="w-full h-16 text-xl font-bold rounded-2xl
                                           bg-linear-to-r from-blue-600 to-indigo-600
                                           hover:from-blue-700 hover:to-indigo-700
                                           disabled:from-slate-400 disabled:to-slate-500
                                           shadow-xl hover:shadow-2xl transition-all duration-300
                                           disabled:cursor-not-allowed flex items-center justify-center text-white"
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
                                ) : sectors.length === 0 ? (
                                    "Sektorlar yo'q"
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
                        <div
                            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in
                                        dark:bg-slate-800"
                        >
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-full mb-4">
                                    <Gift className="size-10 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                                    Tabriklaymiz! 🎉
                                </h2>
                                <p className="text-slate-600 mb-6 dark:text-slate-400">
                                    Siz yutib oldingiz:
                                </p>
                                <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6">
                                    <div className="text-5xl font-bold text-white">
                                        {lastPrize.label}
                                    </div>
                                    <div className="text-sm text-white/80 mt-2">
                                        {lastPrize.value
                                            ? `Qiymati: ${lastPrize.value}`
                                            : null}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowResult(false)}
                                    className="w-full h-12 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg"
                                >
                                    Yopish
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Spin;
