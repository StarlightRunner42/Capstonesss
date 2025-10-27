define([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/GeoJSONLayer",
  "esri/Graphic",
  "esri/widgets/Expand",
  "esri/widgets/BasemapToggle",
  "esri/widgets/ScaleBar",
  "esri/widgets/Compass"
], function(Map, MapView, GeoJSONLayer, Graphic, Expand, BasemapToggle, ScaleBar, Compass) {
  
  // 🎨 Add modern CSS styles
  const modernStyles = document.createElement('style');
  modernStyles.textContent = `
    /* Modern UI Styles */
    .modern-panel {
      background: linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      transition: all 0.3s ease;
    }
    
    .modern-panel:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .legend-container {
      position: absolute;
      top: 20px;
      right: 20px;
      padding: 20px;
      min-width: 200px;
      z-index: 1000;
    }
    
    .legend-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      padding: 6px 0;
      font-size: 13px;
      color: #34495e;
    }
    
    .data-table-container {
      position: absolute;
      top: 20px;
      left: 20px;
      padding: 20px;
      min-width: 320px;
      max-width: 420px;
      max-height: 500px;
      z-index: 1000;
      overflow-y: auto;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    .data-table th {
      background: linear-gradient(145deg, #9b59b6, #8e44ad);
      color: white;
      padding: 8px 4px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .data-table td {
      padding: 4px;
      border-bottom: 1px solid #ecf0f1;
      color: #2c3e50;
    }
    
    .data-table tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .data-table tr:hover {
      background-color: #f3e5f5;
    }
    
    .youth-count {
      font-weight: 700;
      color: #9b59b6;
    }
    
    .percentage {
      font-size: 9px;
      color: #7f8c8d;
    }
    
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .stats-container {
      position: absolute;
      bottom: 20px;
      left: 20px;
      padding: 20px;
      min-width: 280px;
      z-index: 1000;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    
    .stat-item {
      text-align: center;
      padding: 12px;
      background: rgba(155, 89, 182, 0.1);
      border-radius: 10px;
    }
    
    .stat-number {
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
      display: block;
    }
    
    .stat-label {
      font-size: 11px;
      color: #7f8c8d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    
    .header-container {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 25px;
      z-index: 1000;
      text-align: center;
    }
    
    .header-title {
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
      letter-spacing: 0.5px;
    }
    
    .header-subtitle {
      font-size: 12px;
      color: #7f8c8d;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .info-panel {
      position: absolute;
      top: 28%;
      right: 20px;
      transform: translateY(-50%);
      padding: 20px;
      max-width: 250px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .info-panel.visible {
      opacity: 1;
    }
    
    /* Custom popup styling */
    .esri-popup .esri-popup-header {
      background: linear-gradient(145deg, #9b59b6, #8e44ad);
    }
    
    .esri-popup .esri-popup-header .esri-title {
      color: white;
      font-weight: 600;
    }
  `;
  document.head.appendChild(modernStyles);

  // 1️⃣ Create the base map with modern styling
  const map = new Map({
    basemap: "gray-vector" // More professional look
  });

  // 2️⃣ Create the view with enhanced styling
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [122.9763, 10.8003],
    zoom: 12,
    padding: {
      left: 20,
      right: 240,
      top: 80,
      bottom: 120
    }
  });

  // 3️⃣ Add modern widgets
  const basemapToggle = new BasemapToggle({
    view: view,
    nextBasemap: "satellite"
  });
  view.ui.add(basemapToggle, "bottom-right");

  const scaleBar = new ScaleBar({
    view: view,
    unit: "metric"
  });
  view.ui.add(scaleBar, "bottom-right");

  const compass = new Compass({
    view: view
  });
  view.ui.add(compass, "top-left");

  // 4️⃣ Enhanced barangay data - will be loaded from API
  let barangays = [];

  // 5️⃣ Load Silay City Boundary with enhanced styling
  fetch("/silay-boundary")
    .then(res => res.json())
    .then(geojson => {
      const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const boundaryLayer = new GeoJSONLayer({
        url: url,
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: [155, 89, 182, 0.1],
            outline: { 
              color: [155, 89, 182, 0.8], 
              width: 3,
              style: "dash"
            }
          }
        }
      });

      map.add(boundaryLayer);
    })
    .catch(err => console.error("Error loading boundary:", err));

  // 6️⃣ Function to add enhanced barangay markers
  function addBarangayMarkers(barangayData) {
    // Clear existing graphics first
    view.graphics.removeAll();
    
    barangayData.forEach(b => {
      const point = {
        type: "point",
        longitude: b.lon,
        latitude: b.lat
      };

      // Enhanced color coding with gradients
      let markerColor, markerSize, category;
      if (b.youthCount >= 50) {
        markerColor = [155, 89, 182]; // Purple
        markerSize = "16px";
        category = "High";
      } else if (b.youthCount >= 25) {
        markerColor = [52, 152, 219]; // Blue
        markerSize = "14px";
        category = "Medium";
      } else {
        markerColor = [46, 204, 113]; // Green
        markerSize = "12px";
        category = "Low";
      }

      const markerSymbol = {
        type: "simple-marker",
        color: markerColor,
        size: markerSize,
        outline: { 
          color: "white", 
          width: 3 
        },
        style: "circle"
      };

      const youthPercentage = ((b.youthCount / b.population) * 100).toFixed(1);

      const pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: { 
          name: b.name, 
          youthCount: b.youthCount,
          maleCount: b.maleCount,
          femaleCount: b.femaleCount,
          skRegistered: b.skRegistered,
          skVoted: b.skVoted,
          nationalRegistered: b.nationalRegistered,
          population: b.population,
          percentage: youthPercentage,
          category: category
        },
        popupTemplate: {
          title: "{name}",
          content: `
            <div style="padding: 10px; font-family: 'Segoe UI', sans-serif;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 10px; background: #ecf0f1; border-radius: 8px;">
                  <strong style="font-size: 18px; color: #2c3e50;">{youthCount}</strong>
                  <div style="font-size: 12px; color: #7f8c8d;">Youths</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #ecf0f1; border-radius: 8px;">
                  <strong style="font-size: 18px; color: #2c3e50;">{percentage}%</strong>
                  <div style="font-size: 12px; color: #7f8c8d;">of Population</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 8px; background: #3498db; color: white; border-radius: 6px;">
                  <strong>{maleCount}</strong>
                  <div style="font-size: 10px;">Male</div>
                </div>
                <div style="text-align: center; padding: 8px; background: #e91e63; color: white; border-radius: 6px;">
                  <strong>{femaleCount}</strong>
                  <div style="font-size: 10px;">Female</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 6px; background: #f39c12; color: white; border-radius: 4px;">
                  <strong>{skRegistered}</strong>
                  <div style="font-size: 9px;">SK Reg</div>
                </div>
                <div style="text-align: center; padding: 6px; background: #27ae60; color: white; border-radius: 4px;">
                  <strong>{skVoted}</strong>
                  <div style="font-size: 9px;">SK Voted</div>
                </div>
                <div style="text-align: center; padding: 6px; background: #e74c3c; color: white; border-radius: 4px;">
                  <strong>{nationalRegistered}</strong>
                  <div style="font-size: 9px;">Nat Reg</div>
                </div>
              </div>
              <div style="padding: 8px; background: linear-gradient(90deg, #9b59b6, #8e44ad); color: white; border-radius: 6px; text-align: center;">
                <strong>Population: {population}</strong>
              </div>
              <div style="margin-top: 10px; font-size: 12px; color: #7f8c8d; text-align: center;">
                Category: <strong>{category}</strong> Youth Concentration
              </div>
            </div>
          `
        }
      });

      view.graphics.add(pointGraphic);
    });
  }

  // 7️⃣ Modern header
  const headerContainer = document.createElement("div");
  headerContainer.className = "header-container modern-panel";
  headerContainer.innerHTML = `
    <h1 class="header-title">Youth Distribution Map</h1>
    <p class="header-subtitle">Silay City, Negros Occidental</p>
  `;
  view.container.appendChild(headerContainer);

  // 8️⃣ Enhanced legend with modern design
  const legendContainer = document.createElement("div");
  legendContainer.className = "legend-container modern-panel";
  legendContainer.innerHTML = `
    <div class="legend-title">
      <span>📍</span> Youth Concentration Levels
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #9b59b6;"></div>
      <span><strong>High</strong> (50+ Youths)</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #3498db;"></div>
      <span><strong>Medium</strong> (25-49 Youths)</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #2ecc71;"></div>
      <span><strong>Low</strong> (0-24 Youths)</span>
    </div>
  `;
  view.container.appendChild(legendContainer);

  // // 8.5️⃣ Data table container
  // let dataTableContainer = document.createElement("div");
  // dataTableContainer.className = "data-table-container modern-panel";
  // view.container.appendChild(dataTableContainer);

  // // Function to create and update data table
  // function updateDataTable(barangayData) {
  //   // Sort by Youth count descending
  //   const sortedData = [...barangayData].sort((a, b) => b.youthCount - a.youthCount);
    
  //   const tableHTML = `
  //     <div class="legend-title">
  //       <span>📊</span> Youth Count by Barangay
  //     </div>
  //     <table class="data-table">
  //       <thead>
  //         <tr>
  //           <th>Barangay</th>
  //           <th>Youths</th>
  //           <th>M/F</th>
  //           <th>SK Reg</th>
  //           <th>SK Vote</th>
  //           <th>%</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         ${sortedData.map(barangay => {
  //           const percentage = ((barangay.youthCount / barangay.population) * 100).toFixed(1);
  //           return `
  //             <tr>
  //               <td>${barangay.name}</td>
  //               <td class="youth-count">${barangay.youthCount}</td>
  //               <td style="font-size: 9px;">${barangay.maleCount}M/${barangay.femaleCount}F</td>
  //               <td style="font-size: 9px; color: #f39c12;">${barangay.skRegistered}</td>
  //               <td style="font-size: 9px; color: #27ae60;">${barangay.skVoted}</td>
  //               <td class="percentage">${percentage}%</td>
  //             </tr>
  //           `;
  //         }).join('')}
  //       </tbody>
  //     </table>
  //   `;
    
  //   dataTableContainer.innerHTML = tableHTML;
  // }

  // 9️⃣ Enhanced statistics panel - will be updated with real data
  let statsContainer = document.createElement("div");
  statsContainer.className = "stats-container modern-panel";
  view.container.appendChild(statsContainer);

  // Function to update statistics panel
  function updateStatistics(barangayData) {
    const totalYouths = barangayData.reduce((sum, b) => sum + b.youthCount, 0);
    const totalMales = barangayData.reduce((sum, b) => sum + b.maleCount, 0);
    const totalFemales = barangayData.reduce((sum, b) => sum + b.femaleCount, 0);
    const totalSkRegistered = barangayData.reduce((sum, b) => sum + b.skRegistered, 0);
    const totalSkVoted = barangayData.reduce((sum, b) => sum + b.skVoted, 0);
    const totalNationalRegistered = barangayData.reduce((sum, b) => sum + b.nationalRegistered, 0);
    const totalPopulation = barangayData.reduce((sum, b) => sum + b.population, 0);
    const averageYouthPercentage = ((totalYouths / totalPopulation) * 100).toFixed(1);
    const highestYouth = Math.max(...barangayData.map(b => b.youthCount));
    const highestBarangay = barangayData.find(b => b.youthCount === highestYouth).name;

    statsContainer.innerHTML = `
      <div class="legend-title">
         Youth Statistics Overview
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${totalYouths}</span>
          <div class="stat-label">Total Youths</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${barangayData.length}</span>
          <div class="stat-label">Barangays</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${totalMales}</span>
          <div class="stat-label">Male Youths</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${totalFemales}</span>
          <div class="stat-label">Female Youths</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${totalSkRegistered}</span>
          <div class="stat-label">SK Registered</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${totalSkVoted}</span>
          <div class="stat-label">SK Voted</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${averageYouthPercentage}%</span>
          <div class="stat-label">Average Rate</div>
        </div>
        <div class="stat-item">
          <span class="stat-number">${highestYouth}</span>
          <div class="stat-label">Highest Count</div>
        </div>
      </div>
      <div style="margin-top: 15px; padding: 10px; background: rgba(155, 89, 182, 0.1); border-radius: 8px;">
        <div style="font-size: 12px; color: #9b59b6; font-weight: 600;">
          Highest Youth Population: ${highestBarangay}
        </div>
        <div style="font-size: 10px; color: #7f8c8d; margin-top: 5px;">
          National Registered: ${totalNationalRegistered} | SK Participation: ${((totalSkVoted/totalSkRegistered)*100).toFixed(1)}%
        </div>
      </div>
    `;
  }

  // 🔟 Info toggle panel
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "toggle-btn";
  toggleBtn.title = "Toggle Information Panel";

  const infoPanel = document.createElement("div");
  infoPanel.className = "info-panel modern-panel";
  infoPanel.innerHTML = `
    <div class="legend-title">
      <span>🎯</span> Quick Guide
    </div>
    <div style="font-size: 13px; line-height: 1.6; color: #34495e;">
      <p><strong>Click</strong> markers to view detailed Youth information</p>
      <p><strong>Zoom</strong> and pan to explore different areas</p>
      <p><strong>Toggle</strong> basemap for satellite view</p>
      <p><strong>Youth data</strong> represents registered youths per barangay</p>
      <p><strong>SK data</strong> shows Sangguniang Kabataan participation</p>
    </div>
  `;

  toggleBtn.addEventListener("click", () => {
    infoPanel.classList.toggle("visible");
  });

  view.container.appendChild(toggleBtn);
  view.container.appendChild(infoPanel);

  // 11️⃣ Enhanced click debugging
  view.on("click", (event) => {
    const lat = event.mapPoint.latitude.toFixed(6);
    const lon = event.mapPoint.longitude.toFixed(6);
    console.log(`📍 Clicked coordinates: Lat: ${lat}, Lon: ${lon}`);
  });

  // 12️⃣ Add loading animation (optional)
  view.when(() => {
    console.log("🗺️ Silay City Youth Map loaded successfully!");

    // Add subtle entrance animation
    const panels = document.querySelectorAll('.modern-panel');
    panels.forEach((panel, index) => {
      setTimeout(() => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';
        panel.style.transition = 'all 0.6s ease';
        setTimeout(() => {
          panel.style.opacity = '1';
          panel.style.transform = 'translateY(0)';
        }, 100);
      }, index * 200);
    });
  });

  // 13️⃣ Dynamic Youth data loader (enhanced)
  fetch("/youth-map-data")
    .then(res => res.json())
    .then(response => {
      if (response.success) {
        console.log("📊 Loading real-time Youth data from database...");
        console.log("🗄️ Raw response from server:", response);
        
        barangays = response.data;
        
        // Log each barangay's data
        barangays.forEach(barangay => {
          console.log(`📍 ${barangay.name}: ${barangay.youthCount} Youths (${barangay.maleCount}M, ${barangay.femaleCount}F) (SK: ${barangay.skRegistered} registered, ${barangay.skVoted} voted) (${((barangay.youthCount / barangay.population) * 100).toFixed(1)}% of population)`);
        });
        
        // Add markers with real data
        addBarangayMarkers(barangays);
        
        // Update statistics panel
        updateStatistics(barangays);
        
        // Update data table
        updateDataTable(barangays);
        
        console.log("✅ Youth data loaded successfully from database:", barangays);
      } else {
        console.error("❌ Error loading Youth data:", response.message);
      }
    })
    .catch(err => console.error("❌ Error loading Youth data:", err));

});