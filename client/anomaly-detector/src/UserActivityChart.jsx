// UserActivityChart.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  const [selectedAction, setSelectedAction] = useState(''); // default: all actions

  useEffect(() => {
    // Construct the URL with query parameter if an action is selected
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
        const data = response.data;
        const labels = data.map(item => item.timePeriod);
        const counts = data.map(item => item.count);
        setChartData({
          labels,
          datasets: [
            {
              label: 'Activity Count',
              data: counts,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }
          ]
        });
      })
      .catch(error => console.error('Error fetching timeseries data:', error));
  }, [selectedAction]);

  return (
    <div>
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
          {/* Add other options as needed */}
        </select>
      </div>
      <Line data={chartData} />
    </div>
  );
};

export default UserActivityChart;
