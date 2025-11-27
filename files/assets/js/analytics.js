// Dynamic OSCA data source
let barangayData = {};

let currentChart = null;
let currentPage = 1;
const itemsPerPage = 5;
let filteredData = [];
let allData = [];
let currentChartType = 'doughnut';

// Calculate statistics (computed after data load)
let totalOSCA = 0;
let averageOSCA = 0;
let totalWithPension = 0;
let totalWithoutPension = 0;
let seniorPercentage = 0;
let pensionPercentage = 0;
let noPensionPercentage = 0;
let highestPopulation = { name: '', count: 0 };
let lowestPopulation = { name: '', count: Infinity };

// Update stats display
function updateStatsDisplay() {
    document.getElementById('totalOSCA').textContent = totalOSCA.toLocaleString();
    document.getElementById('averageOSCA').textContent = averageOSCA;
}

// Initialize data
function initializeData() {
    const entries = Object.entries(barangayData);
    totalOSCA = entries.reduce((sum, [_, data]) => sum + data.oscaCount, 0);
    totalWithPension = entries.reduce((sum, [_, data]) => sum + (data.withPension || 0), 0);
    totalWithoutPension = totalOSCA - totalWithPension;
    
    averageOSCA = entries.length ? Math.round(totalOSCA / entries.length) : 0;
    pensionPercentage = totalOSCA ? ((totalWithPension / totalOSCA) * 100).toFixed(1) : '0.0';
    noPensionPercentage = totalOSCA ? ((totalWithoutPension / totalOSCA) * 100).toFixed(1) : '0.0';
    
    // Find highest and lowest populations
    highestPopulation = { name: '', count: 0 };
    lowestPopulation = { name: '', count: Infinity };
    
    entries.forEach(([id, data]) => {
        if (data.oscaCount > highestPopulation.count) {
            highestPopulation = { name: data.name, count: data.oscaCount };
        }
        if (data.oscaCount < lowestPopulation.count && data.oscaCount > 0) {
            lowestPopulation = { name: data.name, count: data.oscaCount };
        }
    });
    
    if (lowestPopulation.count === Infinity) {
        lowestPopulation = { name: 'N/A', count: 0 };
    }

    updateStatsDisplay();

    allData = entries.map(([id, data]) => ({
        id: parseInt(id),
        name: data.name,
        oscaCount: data.oscaCount,
        withPension: data.withPension || 0,
        withoutPension: data.oscaCount - (data.withPension || 0),
        percentage: totalOSCA ? ((data.oscaCount / totalOSCA) * 100).toFixed(1) : '0.0',
        pensionPercentage: data.oscaCount ? (((data.withPension || 0) / data.oscaCount) * 100).toFixed(1) : '0.0'
    }));
    filteredData = [...allData];
}

async function loadOscaData() {
    try {
        const res = await fetch('/api/analytics/osca', { credentials: 'same-origin' });
        const json = await res.json();
        if (!json.success) throw new Error('Failed to fetch OSCA data');

        // Map into barangayData with numeric ids as keys
        barangayData = {};
        json.data.forEach(item => {
            barangayData[item.id] = { 
                name: item.name, 
                oscaCount: item.oscaCount,
                withPension: item.withPension || Math.floor(item.oscaCount * 0.65), // Default 65% if not provided
                withoutPension: item.withoutPension || Math.ceil(item.oscaCount * 0.35)
            };
        });

        initializeData();
        renderTable();
        renderPagination();
    } catch (err) {
        console.error(err);
        // Fallback: keep empty state
        barangayData = {};
        initializeData();
        renderTable();
        renderPagination();
    }
}

// Render table rows
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
            <td class="osca-count">${item.oscaCount.toLocaleString()}</td>
            <td>
                <button class="view-chart-btn" onclick="showChart(${item.id})">
                     View Chart
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Render pagination
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

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        renderPagination();
    }
}

// Search functionality
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

// Switch chart type
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

// Render chart table
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

// Update chart
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

// Show chart modal with complete statistics
function showChart(barangayId) {
    const barangay = allData.find(item => item.id === barangayId);
    const modal = document.getElementById('chartModal');
    const modalTitle = document.getElementById('modalTitle');
    const chartInfo = document.getElementById('chartInfo');
    
    modalTitle.textContent = `${barangay.name} - OSCA `;
    modalTitle.dataset.barangayId = barangayId;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const selectedCount = barangay.oscaCount;
    const selectedPercentage = barangay.percentage;
    const othersPercentage = (100 - parseFloat(selectedPercentage)).toFixed(1);
    
    // Calculate insight based on comparison to average
    let insight = '';
    const avgComparison = ((selectedCount - averageOSCA) / averageOSCA * 100).toFixed(1);
    if (selectedCount > averageOSCA) {
        insight = `This barangay has ${Math.abs(avgComparison)}% more seniors than the municipal average.`;
    } else if (selectedCount < averageOSCA) {
        insight = `This barangay has ${Math.abs(avgComparison)}% fewer seniors than the municipal average.`;
    } else {
        insight = 'This barangay has an average senior citizen population.';
    }

    // Update chart info with simple clean style
    chartInfo.innerHTML = `
        <h3>${barangay.name} Statistics</h3>
        <p><strong>Total Registered:</strong> ${selectedCount.toLocaleString()}</p>
        <p><strong>Senior Percentage:</strong> ${selectedPercentage}%</p>
        <p><strong>With Pension:</strong> ${barangay.withPension.toLocaleString()} (${barangay.pensionPercentage}%)</p>
        <p><strong>Without Benefits:</strong> ${barangay.withoutPension.toLocaleString()} (${(100 - parseFloat(barangay.pensionPercentage)).toFixed(1)}%)</p>
        
        <h3 style="margin-top: 20px;">Municipality Statistics</h3>
        <p><strong>Highest Population:</strong> ${highestPopulation.name} (${highestPopulation.count.toLocaleString()})</p>
        <p><strong>Lowest Population:</strong> ${lowestPopulation.name} (${lowestPopulation.count.toLocaleString()})</p>
        <p><strong>Average per Barangay:</strong> ${averageOSCA.toLocaleString()}</p>
        <p><strong>Total Without Benefits:</strong> ${totalWithoutPension.toLocaleString()} (${noPensionPercentage}%)</p>
        
        <h3 style="margin-top: 20px;">Insight</h3>
        <p>${insight}</p>
    `;

    currentChartType = 'doughnut';
    document.querySelectorAll('.chart-type-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[onclick="switchChartType(\'doughnut\')"]').classList.add('active');
    
    document.getElementById('chartContainer').style.display = 'block';
    document.getElementById('tableContainer').style.display = 'none';

    updateChart();
}

// Close modal functionality
function closeModal() {
    const modal = document.getElementById('chartModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }
}

// Event listeners
document.querySelector('.close').onclick = closeModal;
document.getElementById('searchInput').oninput = handleSearch;

window.onclick = function(event) {
    const modal = document.getElementById('chartModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Generate Report Function
async function generateSeniorCitizensReport() {
    try {
        // Show loading indicator
        const generateReportBtn = document.getElementById('generateReportBtn');
        const originalText = generateReportBtn.innerHTML;
        generateReportBtn.disabled = true;
        generateReportBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Generating...';
        
        // Fetch all senior citizens data to get gender breakdown
        const seniorDataResponse = await fetch('/api/senior-citizens-for-report', { credentials: 'same-origin' });
        
        let seniors = [];
        if (seniorDataResponse.ok) {
            const seniorData = await seniorDataResponse.json();
            if (seniorData.success && seniorData.data) {
                seniors = seniorData.data;
            }
        } else {
            console.warn('Could not fetch detailed senior data');
        }
        
        // Build report table HTML
        const tableHtml = buildSeniorCitizensReportTableHtml(seniors, allData);
        
        // Open new window for report
        const newWin = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
        
        if (!newWin) {
            alert('Popup blocked! Please allow popups for this site to view the report.');
            return;
        }
        
        const docHtml = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Senior Citizens Report</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="stylesheet" href="/bower_components/bootstrap/css/bootstrap.min.css">
    <style>
        body { padding: 30px; font-family: Arial, sans-serif; }

        .header-wrapper {
            position: relative;
            margin-bottom: 20px;
            min-height: 130px;
        }

        .logo-left {
            position: absolute;
            top: 0;
            left: 0;
            width: 95px;
        }

        .logo-right {
            position: absolute;
            top: 0;
            right: 0;
            width: 120px;
        }

        .main-header {
            text-align: center;
            margin-top: 15px;
        }

        .title-section { 
            margin-top: 15px; 
            text-align: center;
        }

        .report-info {
            margin: 20px auto;
            text-align: center;
            font-size: 13px;
            line-height: 1.8;
            max-width: 800px;
            white-space: nowrap;
        }

        .info-item {
            display: inline-block;
            margin: 0 15px;
        }

        .underline {
            display: inline-block;
            border-bottom: 1px solid #000;
            width: 120px;
            height: 14px;
            vertical-align: bottom;
            margin-left: 5px;
        }

        .address-underline {
            width: 150px;
        }

        .generated-date {
            margin-top: 10px;
            font-style: italic;
        }
    </style>
</head>

<body>

<div class="container">
    <div class="text-center generated-date">
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="header-wrapper">
        <img src="/assets/images/SilayLogo.jpg" class="logo-left">
        <img src="/assets/images/BagongPilipinas.jpg" class="logo-right">

        <div class="main-header">
            <h4>Republic of the Philippines</h4>
            <h2><strong>SILAY CITY GOVERNMENT</strong></h2>
            <p>Office of Senior Citizens Affairs</p>
        </div>
    </div>

    <div class="title-section">
        <h5>OFFICE OF SENIOR CITIZENS AFFAIRS</h5>
        <h5>ANNUAL ACCOMPLISHMENT REPORT</h5>
    </div>

    <div class="report-info">
        <span class="info-item">Region: <span class="underline"></span></span>
        <span class="info-item">Senior Citizens Statistics: <span class="underline"></span></span>
        <span class="info-item">Address: <span class="underline address-underline"></span></span>
    </div>

    ${tableHtml}

</div>

</body>
</html>`;
        
        newWin.document.open();
        newWin.document.write(docHtml);
        newWin.document.close();
        
        console.log('Report generated successfully');
        
        // Restore button state
        if (generateReportBtn) {
            generateReportBtn.disabled = false;
            generateReportBtn.innerHTML = originalText;
        }
        
    } catch (e) {
        console.error('Error generating report:', e);
        alert('Error generating report: ' + e.message);
        
        // Restore button state on error
        if (generateReportBtn) {
            generateReportBtn.disabled = false;
            generateReportBtn.innerHTML = originalText;
        }
    }
}

// Build table HTML for report
function buildSeniorCitizensReportTableHtml(seniors, barangayData) {
    function esc(s){ 
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;'); 
    }
    
    // Group seniors by barangay and count by gender
    const barangayStats = {};
    
    // If we have detailed senior data, use it
    if (seniors && seniors.length > 0) {
        seniors.forEach(senior => {
            const barangay = senior.identifying_information?.address?.barangay || 'Unknown';
            const gender = (senior.identifying_information?.gender || 'Unknown').toString().toLowerCase();
            
            if (!barangayStats[barangay]) {
                barangayStats[barangay] = {
                    male: 0,
                    female: 0,
                    total: 0
                };
            }
            
            if (gender === 'male') {
                barangayStats[barangay].male++;
            } else if (gender === 'female') {
                barangayStats[barangay].female++;
            }
            
            barangayStats[barangay].total++;
        });
    } else {
        // Fallback: use barangay data from analytics (no gender breakdown available)
        allData.forEach(item => {
            barangayStats[item.name] = {
                male: 0,
                female: 0,
                total: item.oscaCount || 0
            };
        });
    }
    
    // Sort barangays alphabetically
    const sortedBarangays = Object.keys(barangayStats).sort();
    
    // Build table HTML
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Barangay</th>
                        <th>Male</th>
                        <th>Female</th>
                        <th>Total of Citizens</th>
                    </tr>
                </thead>
                <tbody>`;
    
    let grandTotalMale = 0;
    let grandTotalFemale = 0;
    let grandTotal = 0;
    
    sortedBarangays.forEach(barangay => {
        const stats = barangayStats[barangay];
        grandTotalMale += stats.male;
        grandTotalFemale += stats.female;
        grandTotal += stats.total;
        
        html += `
            <tr>
                <td><strong>${esc(barangay)}</strong></td>
                <td>${stats.male}</td>
                <td>${stats.female}</td>
                <td><span class="badge bg-primary">${stats.total}</span></td>
            </tr>`;
    });
    
    // Add total row
    html += `
                </tbody>
                <tfoot class="table-dark">
                    <tr>
                        <td><strong>TOTAL</strong></td>
                        <td><strong>${grandTotalMale}</strong></td>
                        <td><strong>${grandTotalFemale}</strong></td>
                        <td><strong><span class="badge bg-success">${grandTotal}</span></strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    
    // Add summary
    html += `
        <div class="summary" style="margin-top: 20px;">
            <hr>
            <h5>Report Summary</h5>
            <div class="row">
                <div class="col-md-6">
                    <ul class="list-unstyled">
                        <li><strong>Total Senior Citizens:</strong> ${grandTotal}</li>
                        <li><strong>Total Male:</strong> ${grandTotalMale}</li>
                        <li><strong>Total Female:</strong> ${grandTotalFemale}</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <ul class="list-unstyled">
                        <li><strong>Number of Barangays:</strong> ${sortedBarangays.length}</li>
                    </ul>
                </div>
            </div>
        </div>`;
    
    return html;
}

// Initialize the application
loadOscaData();

// Add event listener for Generate Report button
// Use a function that checks if DOM is ready
(function setupGenerateReportButton() {
    function attachListener() {
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', generateSeniorCitizensReport);
        } else {
            // Retry if button not found yet
            setTimeout(attachListener, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachListener);
    } else {
        attachListener();
    }
})();