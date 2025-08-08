import capitalizeFirstLetter from "../../util/capitalizeFirstLetter/CapitalizeFirstLetter";

export default function BorderTabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="flex gap-2 overflow-auto whitespace-nowrap" role='button'>
            {tabs.map((tab, index) => (
                <div key={index} className={`px-3 py-1 rounded-full text-sm  text-center border border-gray-light ${activeTab === tab.value ? `${tab.activeClass}` : ''}`} >
                    <button
                        key={tab.value}
                        className={`text-gray ${activeTab === tab.value ? `${tab.activeClass}` : ''}`}
                        onClick={() => onTabChange(tab.value)}
                    >
                        {capitalizeFirstLetter(tab.label)}
                    </button>
                </div>
            ))}
        </div>
    );
}
