const OCCASIONS = [
  {
    value: 'casual_friday',
    label: 'Casual Friday',
    icon: '👔',
    description: 'Relaxed office look'
  },
  {
    value: 'date_night',
    label: 'Date Night',
    icon: '💕',
    description: 'Romantic evening out'
  },
  {
    value: 'business_meeting',
    label: 'Business Meeting',
    icon: '💼',
    description: 'Professional and polished'
  },
  {
    value: 'weekend_casual',
    label: 'Weekend Casual',
    icon: '☀️',
    description: 'Laid-back weekend style'
  },
];

const OccasionSelector = ({ selectedOccasion, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {OCCASIONS.map(occasion => (
        <button
          key={occasion.value}
          onClick={() => onSelect(occasion.value)}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedOccasion === occasion.value
              ? 'border-primary-600 bg-primary-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
          }`}
        >
          <div className="text-4xl mb-3">{occasion.icon}</div>
          <h3 className="font-semibold text-gray-900 mb-1">{occasion.label}</h3>
          <p className="text-sm text-gray-600">{occasion.description}</p>
        </button>
      ))}
    </div>
  );
};

export default OccasionSelector;
