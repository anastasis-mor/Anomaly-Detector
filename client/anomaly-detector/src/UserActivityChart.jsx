import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';

// Register Chart.js components including TimeScale
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const UserActivityChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Activity Count',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  });
  const [selectedAction, setSelectedAction] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Define chart options with clean x-axis
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Activity Over Time',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            // Format the tooltip title nicely
            const date = new Date(tooltipItems[0].label);
            return date.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d'
          },
          tooltipFormat: 'MMM d, HH:mm'
        },
        grid: {
          display: true
        },
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          // Only show date format without any numbers
          callback: function(value, index, values) {
            const date = new Date(value);
            // Only show a few dates to avoid crowding
            if (index % 4 === 0) {
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
            }
            return null; // Return null for empty label
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Activities'
        }
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    let url = 'http://localhost:8080/api/logs/timeseries';
    if (selectedAction) {
      url += `?action=${selectedAction}`;
    }

    axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(response => {
        console.log('API Response:', response.data);
        const data = response.data;
        
        if (data && data.length > 0) {
          // Transform the data for time-based x-axis
          const transformedData = data.map(item => {
            // Parse the date string to a Date object
            const [datePart, timePart] = item.timePeriod.split(' ');
            const [month, day, year] = datePart.split('/');
            const [hour] = timePart.split(':');
            
            // JavaScript months are 0-indexed
            const date = new Date(year, month - 1, day, hour);
            
            return {
              x: date, // Use Date object as x value
              y: item.count // Keep count as y value
            };
          });
          
          setChartData({
            datasets: [
              {
                label: selectedAction ? `${selectedAction} Count` : 'Activity Count',
                data: transformedData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
              }
            ]
          });
        } else {
          // Set empty data with structure intact
          setChartData({
            datasets: [
              {
                label: 'No Data Available',
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
              }
            ]
          });
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching timeseries data:', error);
        setIsLoading(false);
      });
  }, [selectedAction]);

  return (
    <div className="chart-container">
      <h2>User Activity Chart</h2>
      <div>
        <label htmlFor="actionFilter">Filter by Action:</label>
        <select
          id="actionFilter"
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
        >
          <option value="">All</option>
          <option value="login">Successful Login</option>
          <option value="failed_login">Failed Login</option>
          <option value="click">Click</option>
        </select>
      </div>
      
      <div style={{ height: '400px', width: '100%', position: 'relative' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', paddingTop: '150px' }}>Loading chart data...</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default UserActivityChart;