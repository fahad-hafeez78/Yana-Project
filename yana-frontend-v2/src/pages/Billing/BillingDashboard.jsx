import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import billingMiddleware from "../../redux/middleware/billingMiddleware";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import SummaryCards from "../../components/Billings/billingDashboard/SummaryCards";
import DateRangeSelector from "../../components/Billings/billingDashboard/DateRangeSelector";
import BillingChart from "../../components/Billings/billingDashboard/BillingChart";
import ClaimsTable from "../../components/Billings/billingDashboard/ClaimsTable";


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
);

export default function BillingDashboard () {

  const dispatch = useDispatch();

  const [claims, setClaims] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [chartData, setChartData] = useState(null);
  const [cards, setCards] = useState([
    { title: "Total Billed", value: "$0", bg: "bg-blue" },
    { title: "Paid Amount", value: "$0", bg: "bg-green-dark" },
    { title: "Pending Amount", value: "$0", bg: "bg-yellow-700" },
    { title: "Denied Amount", value: "$0", bg: "bg-red-dark" },
  ]);
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [requireYearSelection, setRequireYearSelection] = useState(false);
  const [monthSelected, setMonthSelected] = useState(false);
  const [yearSelected, setYearSelected] = useState(false);

  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  // Chart options
  const [chartOptions] = useState({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: $${context.raw.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  });

  useEffect(() => {
    if ((timeRange === 'year' && yearSelected) ||
      (timeRange === 'month' && !requireYearSelection && !monthSelected)) {
      fetchStatsWithClaims();
    }
  }, [selectedMonth, selectedYear, timeRange, requireYearSelection, monthSelected, yearSelected]);

  const fetchStatsWithClaims = async () => {
    try {
      const response = await dispatch(
        billingMiddleware.GetStatsWithClaim(
          timeRange,
          timeRange === 'month' ? selectedMonth : null,
          selectedYear
        )
      );

      if (response?.success) {
        const { statistics } = response;
        setClaims(statistics.claims || []);
        updateSummaryCards(statistics.totals);
        prepareChartData(statistics.graphStats, statistics.totals);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };

  const updateSummaryCards = (totals) => {
    setCards([
      {
        title: "Total Billed",
        value: `$${(totals?.totalBilledAmount || 0).toLocaleString()}`,
        bg: "bg-blue"
      },
      {
        title: "Paid Amount",
        value: `$${(totals?.totalPaidAmount || 0).toLocaleString()}`,
        bg: "bg-green-dark"
      },
      {
        title: "Pending Amount",
        value: `$${(totals?.totalPendingAmount || 0).toLocaleString()}`,
        bg: "bg-yellow-600"
      },
      {
        title: "Denied Amount",
        value: `$${(totals?.totalDeniedAmount || 0).toLocaleString()}`,
        bg: "bg-red-dark"
      },
    ]);
  };

  const prepareChartData = (graphStats, totals) => {
    if (!graphStats || graphStats.length === 0) {
      setChartData(null);
      return;
    }

    const isMonthly = timeRange === 'month';
    const labels = graphStats.map(stat =>
      isMonthly
        ? moment(stat._id).format('MMM DD')
        : moment(stat._id, 'YYYY-MM').format('MMM YYYY')
    );

    const data = {
      labels,
      datasets: [
        {
          label: 'Total Billed',
          data: graphStats.map(stat => stat.billedAmount || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.1
        },
        {
          label: 'Paid Amount',
          data: graphStats.map(stat => stat.paidAmount || 0),
          borderColor: 'rgb(21, 128, 61)',
          backgroundColor: 'rgba(21, 128, 61, 0.5)',
          tension: 0.1
        },
      ]
    };

    setChartData(data);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setShowMonthDropdown(false);
    setTimeRange('month');
    setRequireYearSelection(true);
    setMonthSelected(true);
    setYearSelected(false);
    setShowYearDropdown(true);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
    setYearSelected(true);

    if (requireYearSelection) {
      setTimeRange('month');
      setMonthSelected(false);
    } else {
      setTimeRange('year');
    }
    setRequireYearSelection(false);
  };

  const handleMonthClick = () => {
    setShowMonthDropdown(!showMonthDropdown);
    setShowYearDropdown(false);
  };

  const handleYearClick = () => {
    setRequireYearSelection(false);
    setMonthSelected(false);
    setYearSelected(false);
    setTimeRange('year');
    setShowYearDropdown(!showYearDropdown);
    setShowMonthDropdown(false);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex h-full flex-col md:flex-row gap-3">
        <SummaryCards cards={cards} />

        <div className="w-full md:w-8/12 bg-white rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Billing Analytics</h3>
            <DateRangeSelector
              timeRange={timeRange}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              showMonthDropdown={showMonthDropdown}
              showYearDropdown={showYearDropdown}
              years={years}
              requireYearSelection={requireYearSelection}
              onMonthClick={handleMonthClick}
              onYearClick={handleYearClick}
              onMonthSelect={handleMonthSelect}
              onYearSelect={handleYearSelect}
            />
          </div>
          <BillingChart chartData={chartData} chartOptions={chartOptions} />
        </div>
      </div>

      <ClaimsTable claims={claims} />
    </div>
  );
};
