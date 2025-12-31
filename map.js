const LOCATIONS = [
  { name: "Olsztyn", pos: { lat: 53.7833, lng: 20.5 } },
  { name: "Warszawa", pos: { lat: 52.2297, lng: 21.0122 } },
  { name: "Kraków", pos: { lat: 50.0647, lng: 19.945 } },

  // Dodane:
  { name: "Koszalin", pos: { lat: 54.1833, lng: 16.1833 } }, // 54°11'N 16°11'E [page:1]
  { name: "Szczecin", pos: { lat: 53.4333, lng: 14.55 } }, // 53°26'N 14°33'E [page:1]
  { name: "Gdańsk", pos: { lat: 54.3667, lng: 18.6333 } }, // 54°22'N 18°38'E [page:1]
  { name: "Białystok", pos: { lat: 53.1333, lng: 23.1667 } }, // 53°08'N 23°10'E [page:1]
  { name: "Toruń", pos: { lat: 53.0167, lng: 18.6 } }, // 53°01'N 18°36'E [page:1]
  { name: "Poznań", pos: { lat: 52.4167, lng: 16.9167 } }, // 52°25'N 16°55'E [page:1]
  { name: "Zielona Góra", pos: { lat: 51.9333, lng: 15.5 } }, // 51°56'N 15°30'E [page:1]
  { name: "Łódź", pos: { lat: 51.7833, lng: 19.4667 } }, // 51°47'N 19°28'E [page:1]
  { name: "Wrocław", pos: { lat: 51.1167, lng: 17.0333 } }, // 51°07'N 17°02'E [page:1]
  { name: "Lublin", pos: { lat: 51.2333, lng: 22.5667 } }, // 51°14'N 22°34'E [page:1]
  { name: "Opole", pos: { lat: 50.6667, lng: 17.9333 } }, // 50°40'N 17°56'E [page:1]
  { name: "Kielce", pos: { lat: 50.8833, lng: 20.6167 } }, // 50°53'N 20°37'E [page:1]
  { name: "Piekary Śląskie", pos: { lat: 50.3833, lng: 18.95 } }, // 50°23'N 18°57'E [page:1]
  { name: "Łańcut", pos: { lat: 50.0667, lng: 22.2333 } }, // 50°04'N 22°14'E [page:1]

  { name: "Praga (Czechy)", pos: { lat: 50.0833, lng: 14.4167 } }, // 50°05'N 14°25'E [web:204]
  { name: "Bratysława (Słowacja)", pos: { lat: 48.15, lng: 17.1167 } }, // 48°09'N 17°07'E [web:204]
  { name: "Ryga (Łotwa)", pos: { lat: 56.8833, lng: 24.0833 } }, // 56°53'N 24°05'E [web:204]
];

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 52.1, lng: 19.4 },
    zoom: 6,
    mapId: "DEMO_MAP_ID",
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
}

window.initMap = initMap;
