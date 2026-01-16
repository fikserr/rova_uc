import { Edit2, Trash2 } from "lucide-react";

function ProductCard({ product, onEdit, onDelete, cardFor }) {
    const calculateProfit = (sellPrice, costPrice, costCurrency) => {
        const usdRate = 12500; // Example rate
        const costInUZS =
            costCurrency === "USD" ? costPrice * usdRate : costPrice;
        return sellPrice - costInUZS;
    };

    return (
        <div
            key={product.id}
            className={`bg-white rounded-lg p-6 shadow-sm border-2 transition-all ${
                product.is_active
                    ? "border-blue-200"
                    : "border-gray-200 opacity-60"
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-0">
                    <h4 className="text-lg font-semibold text-gray-900 capitalize">
                        {product.title}
                    </h4>
                    {product.service_type == "premium" ? (
                        <span className="text-xs bg-blue-200 w-max py-0.5 px-3 rounded-md">
                            👑 premium
                        </span>
                    ) : product.service_type == "stars" ? (
                        <span className="text-xs bg-amber-200 w-max py-0.5 px-3 rounded-md">
                            ⭐ stars
                        </span>
                    ) : null}
                </div>
                <button
                    onClick={() => (product.is_active = !product.is_active)}
                    className={
                        product.is_active ? "text-blue-600" : "text-gray-400"
                    }
                >
                    {/* {product.is_active  ? (
                        <ToggleRight className="w-6 h-6" />
                    ) : (
                        <ToggleLeft className="w-6 h-6" />
                    )} */}
                    {product.is_active ? (
                        <span className="text-green-600">Aktiv</span>
                    ) : (
                        <span className="text-red-500">Noaktiv</span>
                    )}
                </button>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{cardFor == 'uc' ? 'UC Amount' : cardFor == "diamonds" ? 'Diamond Amount' : cardFor == 'services' && product.service_type == "stars" ? 'Stars Amount' : "Premium period"}:</span>
                    <span className="text-sm font-medium text-gray-900">
                        {cardFor == "uc"
                            ? product.uc_amount
                            : cardFor == "diamonds"
                            ? product.diamonds
                            : cardFor == "services" && product.value}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Sell Price:</span>
                    <span className="text-sm font-medium text-gray-900">
                        {product.sell_price}
                        {` `}
                        {product.sell_currency}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Cost Price:</span>
                    <span className="text-sm font-medium text-gray-900">
                        ${product.cost_price}
                    </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-gray-500">Profit:</span>
                    <span className="text-sm font-medium text-green-600">
                        {calculateProfit(
                            product.sell_price,
                            product.cost_price,
                            product.cost_currency
                        ).toLocaleString()}{" "}
                        UZS
                    </span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );
}

export default ProductCard;
