 // JavaScript for map functionality
 let map;
 let isSatellite = false;
 const silayCoordinates = { lat: 10.7925, lng: 123.0035 }; // Coordinates for Silay City
 
 function initMap() {
     map = new google.maps.Map(document.getElementById("map"), {
         center: silayCoordinates,
         zoom: 14,
         mapTypeId: google.maps.MapTypeId.ROADMAP,
         mapTypeControl: false,
         fullscreenControl: false,
         streetViewControl: false,
         styles: [
             {
                 "featureType": "administrative",
                 "elementType": "labels.text.fill",
                 "stylers": [{"color": "#444444"}]
             },
             {
                 "featureType": "landscape",
                 "elementType": "all",
                 "stylers": [{"color": "#f2f2f2"}]
             },
             {
                 "featureType": "poi",
                 "elementType": "all",
                 "stylers": [{"visibility": "off"}]
             },
             {
                 "featureType": "road",
                 "elementType": "all",
                 "stylers": [{"saturation": -100}, {"lightness": 45}]
             },
             {
                 "featureType": "road.highway",
                 "elementType": "all",
                 "stylers": [{"visibility": "simplified"}]
             },
             {
                 "featureType": "road.arterial",
                 "elementType": "labels.icon",
                 "stylers": [{"visibility": "off"}]
             },
             {
                 "featureType": "transit",
                 "elementType": "all",
                 "stylers": [{"visibility": "off"}]
             },
             {
                 "featureType": "water",
                 "elementType": "all",
                 "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
             }
         ]
     });

     // Add marker for Silay City center
     const marker = new google.maps.Marker({
         position: silayCoordinates,
         map: map,
         title: "Silay City",
         animation: google.maps.Animation.DROP
     });
     
     // Info window for the marker
     const infoWindow = new google.maps.InfoWindow({
         content: "<div style='padding: 10px;'><h3>Welcome to Silay City</h3><p>The Paris of Negros Occidental</p></div>"
     });
     
     marker.addListener("click", () => {
         infoWindow.open(map, marker);
     });

     // Set up control buttons
     document.getElementById('zoom-in').addEventListener('click', () => {
         map.setZoom(map.getZoom() + 1);
     });
     
     document.getElementById('zoom-out').addEventListener('click', () => {
         map.setZoom(map.getZoom() - 1);
     });
     
     document.getElementById('reset-view').addEventListener('click', () => {
         map.setCenter(silayCoordinates);
         map.setZoom(14);
     });
     
     document.getElementById('toggle-satellite').addEventListener('click', () => {
         isSatellite = !isSatellite;
         map.setMapTypeId(isSatellite ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
         document.getElementById('toggle-satellite').textContent = isSatellite ? "Map" : "Satellite";
     });
 }

 // Load the map when the page is fully loaded
 window.onload = function() {
     // Creating script element to load Google Maps API
     const script = document.createElement('script');
     script.src = "https://maps.app.goo.gl/uahHHMF8XeqpPxnz7";
     script.async = true;
     script.defer = true;
     document.head.appendChild(script);
     
     // Fallback for demonstration when API key is not provided
     setTimeout(() => {
         if (typeof google === 'undefined') {
             document.getElementById('map').innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; background-color: #f0f0f0; color: #666; text-align: center; padding: 20px;"><div><h3>Map Preview Unavailable</h3><p>Please add a valid Google Maps API key to view the interactive map.<br>The map would display Silay City, Negros Occidental here.</p></div></div>';
         }
     }, 2000);
 };