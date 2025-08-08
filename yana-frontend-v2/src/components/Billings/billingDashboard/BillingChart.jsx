import { Line } from 'react-chartjs-2';

export default function BillingChart({ chartData, chartOptions }) {
    // Function to create gradient fill
    const createGradient = (ctx, chartArea, color) => {
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        
        // Convert RGB color to RGBA with transparency
        const colorWithOpacity = color.replace(')', ', 0.2)').replace('rgb', 'rgba');
        const transparentColor = color.replace(')', ', 0)').replace('rgb', 'rgba');
        
        gradient.addColorStop(0, colorWithOpacity);
        gradient.addColorStop(1, transparentColor);
        return gradient;
    };

    // Process chart data to add gradient fills
    const processedData = chartData ? {
        ...chartData,
        datasets: chartData.datasets.map(dataset => ({
            ...dataset,
            fill: true,
            backgroundColor: function(context) {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                
                if (!chartArea) {
                    // This case happens on initial chart load
                    return dataset.backgroundColor;
                }
                
                // Get the border color and create gradient
                return createGradient(ctx, chartArea, dataset.borderColor);
            }
        }))
    } : null;

    return (
        <>
            {processedData ? (
                <div className="w-full h-[250px]">
                    <Line
                        options={{
                            ...chartOptions,
                            responsive: true,
                            maintainAspectRatio: false,
                            elements: {
                                line: {
                                    tension: 0.4 // Adjust the curve of the line
                                }
                            }
                        }}
                        data={processedData}
                    />
                </div>
            ) : (
                <div className="h-[250px] flex items-center justify-center">
                    <p>No data available for the selected period</p>
                </div>
            )}
        </>
    );
};