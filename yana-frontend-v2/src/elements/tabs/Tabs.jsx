export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 ">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`relative px-2 py-1 text-sm font-medium transition-colors duration-200 ${
            activeTab === tab.value 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
          {/* {activeTab === tab.value && (
            <span className="absolute inset-x-1 -bottom-px h-0.5 bg-primary" />
          )} */}
        </button>
      ))}
    </div>
  );
}