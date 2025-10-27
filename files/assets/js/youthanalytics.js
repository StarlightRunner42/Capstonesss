// ======= STATIC DATA (FALLBACK) =======
const staticBarangayData = [
  { id: 1, name: "Barangay 1", lydoCount: 0 },
  { id: 2, name: "Barangay 2", lydoCount: 0 },
  { id: 3, name: "Barangay 3", lydoCount: 0 },
  { id: 4, name: "Barangay 4", lydoCount: 0 },
  { id: 5, name: "Barangay 5", lydoCount: 0 },
  { id: 6, name: "Barangay Mambulac", lydoCount: 0 },
  { id: 7, name: "Barangay Guinhalaran", lydoCount: 0 },
  { id: 8, name: "Barangay E-Lopez", lydoCount: 0 },
  { id: 9, name: "Barangay Bagtic", lydoCount: 0 },
  { id: 10, name: "Barangay Balaring", lydoCount: 0 },
  { id: 11, name: "Barangay Hawaiian", lydoCount: 0 },
  { id: 12, name: "Barangay Patag", lydoCount: 0 },
  { id: 13, name: "Barangay Kapt. Ramon", lydoCount: 0 },
  { id: 14, name: "Barangay Guimbalaon", lydoCount: 0 },
  { id: 15, name: "Barangay Rizal", lydoCount: 0 },
  { id: 16, name: "Barangay Lantad", lydoCount: 0 },
];

// ======= VARIABLES =======
let barangayData = {};
let currentChart = null;
let currentPage = 1;
const itemsPerPage = 5;
let filteredData = [];
let allData = [];
let currentChartType = 'doughnut';

let totalLYDO = 0;
let averageLYDO = 0;
let totalWithPension = 0;
let totalWithoutBenefits = 0;
let highestPopulation = { name: '', count: 0 };
let lowestPopulation = { name: '', count: Infinity };

// ======= AGE CALCULATION UTILITIES =======
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function isWithinYouthAge(birthDate) {
  const age = calculateAge(birthDate);
  return age >= 15 && age <= 30;
}

function shouldArchive(birthDate) {
  const age = calculateAge(birthDate);
  return age > 30;
}

// ======= INITIALIZE DATA =======
function initializeData() {
  const entries = Object.entries(barangayData);

  // Compute totals
  totalLYDO = entries.reduce((sum, [_, data]) => sum + data.lydoCount, 0);
  averageLYDO = entries.length ? Math.round(totalLYDO / entries.length) : 0;

  // Find highest and lowest populations
  highestPopulation = { name: '', count: 0 };
  lowestPopulation = { name: '', count: Infinity };

  entries.forEach(([id, data]) => {
    if (data.lydoCount > highestPopulation.count) {
      highestPopulation = { name: data.name, count: data.lydoCount };
    }
    if (data.lydoCount < lowestPopulation.count && data.lydoCount > 0) {
      lowestPopulation = { name: data.name, count: data.lydoCount };
    }
  });

  // If no data, reset lowest
  if (lowestPopulation.count === Infinity) {
    lowestPopulation = { name: 'N/A', count: 0 };
  }

  // Update statistics display
  document.getElementById('totalLYDO').textContent = totalLYDO.toLocaleString();
  document.getElementById('averageLYDO').textContent = averageLYDO;

  // Convert barangayData into array
  allData = entries.map(([id, data]) => ({
    id: parseInt(id),
    name: data.name,
    lydoCount: data.lydoCount,
    withPension: data.withPension || 0,
    withoutBenefits: data.withoutBenefits || 0,
    percentage: totalLYDO ? ((data.lydoCount / totalLYDO) * 100).toFixed(1) : '0.0'
  }));

  filteredData = [...allData];
}

// ======= LOAD DATA FROM API =======
async function loadLydoData() {
  try {
    console.log('🔄 Loading youth data from API...');
    
    showLoadingState();
    
    const response = await fetch('/api/analytics/youth');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log('✅ Youth data loaded successfully:', result.data);
      
      // Update statistics
      document.getElementById('totalBarangays').textContent = result.data.totalBarangays;
      document.getElementById('totalLYDO').textContent = result.data.totalLYDO.toLocaleString();
      document.getElementById('averageLYDO').textContent = result.data.averageLYDO;
      
      // Calculate pension and benefits statistics
      totalWithPension = result.data.totalWithPension || 0;
      totalWithoutBenefits = result.data.totalWithoutBenefits || 0;
      
      // Process barangay data
      barangayData = {};
      result.data.barangays.forEach(item => {
        barangayData[item.id] = {
          name: item.name,
          lydoCount: item.lydoCount,
          withPension: item.withPension || 0,
          withoutBenefits: item.withoutBenefits || 0
        };
      });
      
      initializeData();
      renderTable();
      renderPagination();
      
      hideLoadingState();
      
      await checkAndArchiveOverageYouth();
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ Error loading youth data:', error);
    
    console.log('🔄 Falling back to static data...');
    loadStaticData();
    hideLoadingState();
    
    showErrorMessage('Failed to load youth data. Using fallback data.');
  }
}

// ======= AUTO-ARCHIVE FUNCTION =======
async function checkAndArchiveOverageYouth() {
  try {
    console.log('🔄 Checking for beneficiaries to auto-archive...');
    
    const response = await fetch('/api/beneficiaries/check-age', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.archivedCount > 0) {
      console.log(`✅ Auto-archived ${result.archivedCount} beneficiaries over age 30`);
      
      showInfoMessage(`${result.archivedCount} beneficiary(ies) automatically archived (age > 30)`);
      
      setTimeout(() => {
        loadLydoData();
      }, 2000);
    }
  } catch (error) {
    console.error('⚠️ Error checking auto-archive:', error);
  }
}

// ======= LOAD STATIC DATA (FALLBACK) =======
function loadStaticData() {
  barangayData = {};

  staticBarangayData.forEach(item => {
    barangayData[item.id] = {
      name: item.name,
      lydoCount: item.lydoCount,
      withPension: 0,
      withoutBenefits: 0
    };
  });

  initializeData();
  renderTable();
  renderPagination();
}

// ======= LOADING STATE FUNCTIONS =======
function showLoadingState() {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = `
    <tr>
      <td colspan="3" style="text-align: center; padding: 40px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
          <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin: 0; color: #666;">Loading youth data...</p>
        </div>
      </td>
    </tr>
  `;
  
  if (!document.querySelector('#spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function hideLoadingState() {
  // Loading state will be replaced by renderTable()
}

function showErrorMessage(message) {
  showNotification(message, '#ff6b6b');
}

function showInfoMessage(message) {
  showNotification(message, '#4CAF50');
}

function showNotification(message, bgColor) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: Arial, sans-serif;
    max-width: 300px;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
  
  if (!document.querySelector('#notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ======= RENDER TABLE =======
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  tbody.innerHTML = '';

  if (pageData.length === 0) {
    document.getElementById('noResults').style.display = 'block';
    document.getElementById('dataTable').style.display = 'none';
    document.getElementById('pagination').style.display = 'none';
    return;
  }

  document.getElementById('noResults').style.display = 'none';
  document.getElementById('dataTable').style.display = 'table';
  document.getElementById('pagination').style.display = 'flex';

  pageData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="barangay-name">${item.name}</td>
      <td class="lydo-count">${item.lydoCount.toLocaleString()}</td>
      <td>
        <button class="view-chart-btn" onclick="showChart(${item.id})">
          View Analytics
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ======= PAGINATION =======
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginationControls = document.getElementById('paginationControls');
  const paginationInfo = document.getElementById('paginationInfo');

  const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);
  paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${filteredData.length} entries`;

  paginationControls.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '◀';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => changePage(currentPage - 1);
  paginationControls.appendChild(prevBtn);

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => changePage(i);
    paginationControls.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '▶';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => changePage(currentPage + 1);
  paginationControls.appendChild(nextBtn);
}

function changePage(page) {
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderTable();
    renderPagination();
  }
}

// ======= SEARCH FUNCTION =======
function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  if (searchTerm === '') {
    filteredData = [...allData];
  } else {
    filteredData = allData.filter(item =>
      item.name.toLowerCase().includes(searchTerm)
    );
  }

  currentPage = 1;
  renderTable();
  renderPagination();
}

// ======= SHOW CHART MODAL =======
function showChart(barangayId) {
  const barangay = allData.find(item => item.id === barangayId);
  const modal = document.getElementById('chartModal');
  const modalTitle = document.getElementById('modalTitle');
  const chartInfo = document.getElementById('chartInfo');

  modalTitle.textContent = `${barangay.name} - Complete Analytics`;
  modalTitle.dataset.barangayId = barangayId;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  // Calculate percentages
  const pensionPercentage = barangay.lydoCount > 0 
    ? ((barangay.withPension / barangay.lydoCount) * 100).toFixed(1) 
    : '0.0';
  const withoutBenefitsPercentage = barangay.lydoCount > 0 
    ? ((barangay.withoutBenefits / barangay.lydoCount) * 100).toFixed(1) 
    : '0.0';
  const othersPercentage = (100 - parseFloat(barangay.percentage)).toFixed(1);

  // Generate insights
  let insights = [];
  if (barangay.lydoCount === highestPopulation.count) {
    insights.push('🏆 This barangay has the HIGHEST youth population');
  }
  if (barangay.lydoCount === lowestPopulation.count && barangay.lydoCount > 0) {
    insights.push('📊 This barangay has the LOWEST youth population');
  }
  if (parseFloat(pensionPercentage) > 50) {
    insights.push('✅ Majority of youth have pension benefits');
  } else if (parseFloat(pensionPercentage) < 20) {
    insights.push('⚠️ Low pension coverage - requires attention');
  }
  if (parseFloat(withoutBenefitsPercentage) > 50) {
    insights.push('❗ High percentage without any benefits');
  }
  if (barangay.lydoCount > averageLYDO) {
    insights.push('📈 Above average youth population');
  } else if (barangay.lydoCount < averageLYDO) {
    insights.push('📉 Below average youth population');
  }

  // Update modal info with comprehensive statistics
  chartInfo.innerHTML = `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #061727; border-bottom: 2px solid #415E72; padding-bottom: 10px;">
        📊 ${barangay.name} Complete Statistics
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #061727;">
          <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Total Registered LYDO</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #061727;">
            ${barangay.lydoCount.toLocaleString()}
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Percentage with Pension</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #28a745;">
            ${pensionPercentage}%
          </p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 11px;">
            (${barangay.withPension.toLocaleString()} out of ${barangay.lydoCount.toLocaleString()})
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545;">
          <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Without Benefits</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #dc3545;">
            ${withoutBenefitsPercentage}%
          </p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 11px;">
            (${barangay.withoutBenefits.toLocaleString()} out of ${barangay.lydoCount.toLocaleString()})
          </p>
        </div>
        
        <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #415E72;">
          <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">% of Total LYDO</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #415E72;">
            ${barangay.percentage}%
          </p>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 11px;">
            Other Barangays: ${othersPercentage}%
          </p>
        </div>
      </div>
      
      <div style="margin-top: 20px; background: white; padding: 15px; border-radius: 6px;">
        <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">
          📍 Comparative Data
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
          <div>
            <strong>🏆 Highest Population:</strong><br/>
            ${highestPopulation.name} (${highestPopulation.count.toLocaleString()})
          </div>
          <div>
            <strong>📊 Lowest Population:</strong><br/>
            ${lowestPopulation.name} (${lowestPopulation.count.toLocaleString()})
          </div>
          <div>
            <strong>📈 Average LYDO:</strong><br/>
            ${averageLYDO.toLocaleString()} per barangay
          </div>
          <div>
            <strong>🎯 Total LYDO:</strong><br/>
            ${totalLYDO.toLocaleString()} across all barangays
          </div>
        </div>
      </div>
      
      ${insights.length > 0 ? `
        <div style="margin-top: 20px; background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">
            💡 Key Insights
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 13px;">
            ${insights.map(insight => `<li style="margin-bottom: 5px;">${insight}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p style="color: #666; font-size: 11px; margin-top: 15px; margin-bottom: 0; text-align: center;">
        <em>* Data filtered for ages 15-30 only</em>
      </p>
    </div>
  `;

  // Reset to default chart
  currentChartType = 'doughnut';
  document.querySelectorAll('.chart-type-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector('[onclick="switchChartType(\'doughnut\')"]').classList.add('active');

  document.getElementById('chartContainer').style.display = 'block';
  document.getElementById('tableContainer').style.display = 'none';

  updateChart();
}

// ======= UPDATE CHART =======
function updateChart() {
  const barangayId = parseInt(document.getElementById('modalTitle').dataset.barangayId);
  const barangay = allData.find(item => item.id === barangayId);

  if (!barangay) return;

  const selectedPercentage = parseFloat(barangay.percentage);
  const othersPercentage = 100 - selectedPercentage;

  if (currentChart) {
    currentChart.destroy();
  }

  const ctx = document.getElementById('pieChart').getContext('2d');
  currentChart = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: [barangay.name, 'Other Barangays'],
      datasets: [{
        data: [selectedPercentage, othersPercentage],
        backgroundColor: ['#061727', '#415E72'],
        borderColor: ['#061727', '#FDFAF6'],
        borderWidth: 2,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: { size: 14, weight: 'bold' }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: ${value.toFixed(1)}%`;
            }
          },
          titleFont: { size: 16 },
          bodyFont: { size: 14 },
          padding: 12
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1000
      }
    }
  });
}

// ======= SWITCH CHART TYPE =======
function switchChartType(type) {
  currentChartType = type;
  const chartContainer = document.getElementById('chartContainer');
  const tableContainer = document.getElementById('tableContainer');
  const chartTypeButtons = document.querySelectorAll('.chart-type-btn');

  chartTypeButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[onclick="switchChartType('${type}')"]`).classList.add('active');

  if (type === 'table') {
    chartContainer.style.display = 'none';
    tableContainer.style.display = 'block';
    renderChartTable();
  } else {
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'none';
    updateChart();
  }
}

// ======= RENDER CHART TABLE =======
function renderChartTable() {
  const tableBody = document.getElementById('chartTableBody');
  const currentBarangay = allData.find(item => item.id === parseInt(document.getElementById('modalTitle').dataset.barangayId));

  if (!currentBarangay) return;

  const data = [
    { name: currentBarangay.name, percentage: currentBarangay.percentage },
    { name: 'Other Barangays', percentage: (100 - parseFloat(currentBarangay.percentage)).toFixed(1) }
  ];

  tableBody.innerHTML = '';
  data.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="display: flex; align-items: center;">
        <div style="width: 20px; height: 20px; background-color: ${index === 0 ? '#061727' : '#415E72'}; margin-right: 10px; border-radius: 4px;"></div>
        ${item.name}
      </td>
      <td><strong>${item.percentage}%</strong></td>
    `;
    tableBody.appendChild(row);
  });
}

// ======= CLOSE MODAL =======
function closeModal() {
  const modal = document.getElementById('chartModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';

  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

// ======= EVENT LISTENERS =======
document.querySelector('.close').onclick = closeModal;
document.getElementById('searchInput').oninput = handleSearch;

window.onclick = function(event) {
  const modal = document.getElementById('chartModal');
  if (event.target === modal) {
    closeModal();
  }
};

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// ======= START APP =======
loadLydoData();