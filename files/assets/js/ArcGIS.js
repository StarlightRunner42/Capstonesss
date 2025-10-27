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
      background: rgba(52, 152, 219, 0.1);
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
      left: 20px;
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
      background: linear-gradient(145deg, #3498db, #2980b9);
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
  view.ui.add(compass, "top-left");10.80240

  // 4️⃣ Enhanced barangay data
  const barangays = [
  { name: "Bagtic", lat: 10.76204, lon: 123.05122, pwdCount: 45, population: 2850 },
  { name: "Balaring", lat: 10.83171, lon: 122.96136, pwdCount: 32, population: 1920 },
  { name: "Barangay I (Poblacion)", lat: 10.80240, lon: 122.97624, pwdCount: 78, population: 4200 }, // ✅ FIXED
  { name: "Barangay II (Poblacion)", lat: 10.79938, lon: 122.97828, pwdCount: 65, population: 3750 },
  { name: "Barangay III (Cinco de Noviembre)", lat: 10.79770, lon: 122.97281, pwdCount: 89, population: 4800 },
  { name: "Barangay IV (Poblacion)", lat: 10.78407, lon: 123.00921, pwdCount: 56, population: 3200 },
  { name: "Barangay V (Poblacion)", lat: 10.78147, lon: 122.99145, pwdCount: 43, population: 2650 },
  { name: "Barangay VI (Hawaiian)", lat: 10.82606, lon: 123.00549, pwdCount: 67, population: 3900 },
  { name: "E Lopez", lat: 10.82060, lon: 123.03538, pwdCount: 29, population: 1800 },
  { name: "Guimbala-on", lat: 10.75730, lon: 123.07857, pwdCount: 38, population: 2300 },
  { name: "Guinhalaran", lat: 10.7811, lon: 122.9666, pwdCount: 52, population: 3100 },
  { name: "Kapitan Ramon", lat: 10.77394, lon: 123.11920, pwdCount: 24, population: 1500 },
  { name: "Lantad", lat: 10.80845, lon: 122.97199, pwdCount: 41, population: 2400 },
  { name: "Mambulac", lat: 10.79754, lon: 122.9679, pwdCount: 35, population: 2100 },
  { name: "Patag", lat: 10.72466, lon: 123.15720, pwdCount: 18, population: 1200 },
  { name: "Rizal", lat: 10.79816, lon: 122.99473, pwdCount: 47, population: 2800 }
];


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
            color: [52, 152, 219, 0.1],
            outline: { 
              color: [52, 152, 219, 0.8], 
              width: 3,
              style: "dash"
            }
          }
        }
      });

      map.add(boundaryLayer);
    })
    .catch(err => console.error("Error loading boundary:", err));

  // 6️⃣ Add enhanced barangay markers
  barangays.forEach(b => {
    const point = {
      type: "point",
      longitude: b.lon,
      latitude: b.lat
    };

    // Enhanced color coding with gradients
    let markerColor, markerSize, category;
    if (b.pwdCount >= 70) {
      markerColor = [231, 76, 60]; // Modern red
      markerSize = "16px";
      category = "High";
    } else if (b.pwdCount >= 40) {
      markerColor = [241, 196, 15]; // Modern orange
      markerSize = "14px";
      category = "Medium";
    } else {
      markerColor = [46, 204, 113]; // Modern green
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

    const pwdPercentage = ((b.pwdCount / b.population) * 100).toFixed(1);

    const pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol,
      attributes: { 
        name: b.name, 
        pwdCount: b.pwdCount,
        population: b.population,
        percentage: pwdPercentage,
        category: category
      },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="padding: 10px; font-family: 'Segoe UI', sans-serif;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
              <div style="text-align: center; padding: 10px; background: #ecf0f1; border-radius: 8px;">
                <strong style="font-size: 18px; color: #2c3e50;">{pwdCount}</strong>
                <div style="font-size: 12px; color: #7f8c8d;">PWDs</div>
              </div>
              <div style="text-align: center; padding: 10px; background: #ecf0f1; border-radius: 8px;">
                <strong style="font-size: 18px; color: #2c3e50;">{percentage}%</strong>
                <div style="font-size: 12px; color: #7f8c8d;">of Population</div>
              </div>
            </div>
            <div style="padding: 8px; background: linear-gradient(90deg, #3498db, #2980b9); color: white; border-radius: 6px; text-align: center;">
              <strong>Population: {population}</strong>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #7f8c8d; text-align: center;">
              Category: <strong>{category}</strong> PWD Concentration
            </div>
          </div>
        `
      }
    });

    view.graphics.add(pointGraphic);
  });

  // 7️⃣ Modern header
  const headerContainer = document.createElement("div");
  headerContainer.className = "header-container modern-panel";
  headerContainer.innerHTML = `
    <h1 class="header-title">PWD Distribution Map</h1>
    <p class="header-subtitle">Silay City, Negros Occidental</p>
  `;
  view.container.appendChild(headerContainer);

  // 8️⃣ Enhanced legend with modern design
  const legendContainer = document.createElement("div");
  legendContainer.className = "legend-container modern-panel";
  legendContainer.innerHTML = `
    <div class="legend-title">
      <span>📍</span> PWD Concentration Levels
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #e74c3c;"></div>
      <span><strong>High</strong> (70+ PWDs)</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #f1c40f;"></div>
      <span><strong>Medium</strong> (40-69 PWDs)</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #2ecc71;"></div>
      <span><strong>Low</strong> (0-39 PWDs)</span>
    </div>
  `;
  view.container.appendChild(legendContainer);

  // 9️⃣ Enhanced statistics panel
  const totalPWDs = barangays.reduce((sum, b) => sum + b.pwdCount, 0);
  const totalPopulation = barangays.reduce((sum, b) => sum + b.population, 0);
  const averagePWDPercentage = ((totalPWDs / totalPopulation) * 100).toFixed(1);
  const highestPWD = Math.max(...barangays.map(b => b.pwdCount));
  const highestBarangay = barangays.find(b => b.pwdCount === highestPWD).name;

  const statsContainer = document.createElement("div");
  statsContainer.className = "stats-container modern-panel";
  statsContainer.innerHTML = `
    <div class="legend-title">
       PWD Statistics Overview
    </div>
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-number">${totalPWDs}</span>
        <div class="stat-label">Total PWDs</div>
      </div>
      <div class="stat-item">
        <span class="stat-number">${barangays.length}</span>
        <div class="stat-label">Barangays</div>
      </div>
      <div class="stat-item">
        <span class="stat-number">${averagePWDPercentage}%</span>
        <div class="stat-label">Average Rate</div>
      </div>
      <div class="stat-item">
        <span class="stat-number">${highestPWD}</span>
        <div class="stat-label">Highest Count</div>
      </div>
    </div>
    <div style="margin-top: 15px; padding: 10px; background: rgba(46, 204, 113, 0.1); border-radius: 8px;">
      <div style="font-size: 12px; color: #27ae60; font-weight: 600;">
        Highest PWD Population: ${highestBarangay}
      </div>
    </div>
  `;
  view.container.appendChild(statsContainer);

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
      <p><strong>Click</strong> markers to view detailed PWD information</p>
      <p><strong>Zoom</strong> and pan to explore different areas</p>
      <p><strong>Toggle</strong> basemap for satellite view</p>
      <p><strong>PWD data</strong> represents registered persons with disabilities per barangay</p>
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
    console.log("🗺️ Silay City PWD Map loaded successfully!");
    
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

  // 13️⃣ Dynamic PWD data loader (enhanced)
  /*
  fetch("/barangay-pwd-data")
    .then(res => res.json())
    .then(pwdData => {
      // Enhanced data processing with animations
      console.log("📊 Loading real-time PWD data...");
      
      pwdData.forEach(data => {
        const existingBarangay = barangays.find(b => b.name === data.name);
        if (existingBarangay) {
          existingBarangay.pwdCount = data.pwdCount;
          // Update graphics with animation
          // Implementation would involve recreating graphics with new data
        }
      });
      
      // Update statistics panel
      updateStatistics();
    })
    .catch(err => console.error("❌ Error loading PWD data:", err));
  */

  function updateStatistics() {
    // Function to dynamically update statistics
    // Implementation would recalculate and update the stats panel
  }

});