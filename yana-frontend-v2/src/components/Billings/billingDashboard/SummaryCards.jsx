export default function SummaryCards({ cards }) {
    return (
        <div className="w-full h-full md:w-4/12">
            <div className="grid h-full grid-cols-2 gap-3">
                {cards.map((card, index) => (
                    <div key={index} className={`flex flex-col h-full p-5 gap-2 justify-between rounded-lg text-white ${card.bg}`}>
                        <span className="text-sm font-semibold">{card.title}</span>
                        <div className="flex justify-between">
                            <span className="text-xl font-bold">|</span>
                            <span className="text-xl font-semibold">{card.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
