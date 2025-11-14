const ItemCard = ({ item, onClick }) => {
  const getCategoryBadgeColor = (category) => {
    const colors = {
      top: 'bg-blue-100 text-blue-800',
      bottom: 'bg-purple-100 text-purple-800',
      dress: 'bg-pink-100 text-pink-800',
      shoes: 'bg-green-100 text-green-800',
      outerwear: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="card cursor-pointer hover:shadow-lg transition-shadow group"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.signed_url}
          alt={item.category}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryBadgeColor(
              item.category
            )}`}
          >
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex flex-wrap gap-1">
          {item.colors?.slice(0, 3).map((color) => (
            <span
              key={color}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize"
            >
              {color}
            </span>
          ))}
          {item.colors?.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
              +{item.colors.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
