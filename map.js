const LOCATIONS = [
  { name: "Olsztyn", pos: { lat: 53.7833, lng: 20.5 } },
  { name: "Warszawa", pos: { lat: 52.2297, lng: 21.0122 } },
  { name: "Kraków", pos: { lat: 50.0647, lng: 19.945 } },
  { name: "Koszalin", pos: { lat: 54.1833, lng: 16.1833 } },
  { name: "Szczecin", pos: { lat: 53.4333, lng: 14.55 } },
  { name: "Gdańsk", pos: { lat: 54.3667, lng: 18.6333 } },
  { name: "Białystok", pos: { lat: 53.1333, lng: 23.1667 } },
  { name: "Toruń", pos: { lat: 53.0167, lng: 18.6 } },
  { name: "Poznań", pos: { lat: 52.4167, lng: 16.9167 } },
  { name: "Zielona Góra", pos: { lat: 51.9333, lng: 15.5 } },
  { name: "Łódź", pos: { lat: 51.7833, lng: 19.4667 } },
  { name: "Wrocław", pos: { lat: 51.1167, lng: 17.0333 } },
  { name: "Lublin", pos: { lat: 51.2333, lng: 22.5667 } },
  { name: "Opole", pos: { lat: 50.6667, lng: 17.9333 } },
  { name: "Kielce", pos: { lat: 50.8833, lng: 20.6167 } },
  { name: "Piekary Śląskie", pos: { lat: 50.3833, lng: 18.95 } },
  { name: "Łańcut", pos: { lat: 50.0667, lng: 22.2333 } },
  { name: "Praga (Czechy)", pos: { lat: 50.0833, lng: 14.4167 } },
  { name: "Bratysława (Słowacja)", pos: { lat: 48.15, lng: 17.1167 } },
  { name: "Ryga (Łotwa)", pos: { lat: 56.8833, lng: 24.0833 } },
];

window.initMap = async function initMap() {
  const { ColorScheme } = await google.maps.importLibrary("core");
  await google.maps.importLibrary("marker"); // AdvancedMarkerElement [web:68]

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 52.1, lng: 19.4 },
    zoom: 6,
    mapId: "c59e2ed112e9d1887745fc9b",
    colorScheme: ColorScheme.LIGHT,
  });

  const info = new google.maps.InfoWindow();

  LOCATIONS.forEach((item) => {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: item.pos,
      title: item.name,
    });

    marker.addListener("click", () => {
      info.setContent(item.name);
      info.open({ anchor: marker, map });
    });
  });
};
