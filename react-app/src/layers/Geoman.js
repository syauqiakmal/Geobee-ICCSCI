import { useEffect, useRef } from "react";
// import { defaultIcon } from '../icons/defaultIcon';
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { useGeomanControls } from "react-leaflet-geoman-v2";
import geodesic from "geographiclib-geodesic";
import { useMap } from "react-leaflet";
import L from "leaflet";
// import { ColorPickerControl } from './ColorPicker';
import { ColorPickerControl } from "./cobacolor";
import { createCustomIcon } from "../icons/customIcon";

export const GeomanToolbar = () => {
  // let coba = null; // Variabel untuk menyimpan nilai coba
  // const [test, setTest] = useState(false); // State untuk menandai apakah coba telah diatur atau tidak
  // Membuat instance ColorPickerControl

  const colorPickerControlRef = useRef(null);
  const map = useMap();

  let newWarna;

  useEffect(() => {
    // Add custom control to the map
    colorPickerControlRef.current = new ColorPickerControl({
      position: "bottomright",
    });
    colorPickerControlRef.current.addTo(map);

    return () => {
      map.removeControl(colorPickerControlRef.current);
    };
  }, [map]);

  const getColorAndOpacity = () => {
    const warna = document.getElementById("color-picker").value;
    const newopacity = colorPickerControlRef.current.getSliderValue();
    newWarna = warna;
    return { warna, newopacity };
  };

  // Temukan elemen dengan kelas "leaflet-marker-icon"
  const markerElement = document.querySelector(
    ".leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive.leaflet-marker-draggable"
  );

  // Periksa apakah elemen ditemukan
  if (markerElement) {
    // Hapus elemen dari DOM
    markerElement.remove();
  }

  useGeomanControls({
    options: {
      position: "bottomright",
      drawCircleMarker: false,
      cutPolygon: false,
      rotateMode: false,
      drawMarker: true,
      drawText: true,
    },

    onCreate: (e) => {
      updatePopupContent(e);
      const layer = e.layer;

      const { warna, newopacity } = getColorAndOpacity();

      if (
        layer instanceof L.Polygon ||
        layer instanceof L.Circle ||
        layer instanceof L.Polyline
      ) {
        layer.setStyle({ color: warna });
        layer.setStyle({ fillOpacity: newopacity });
      } else if (
        layer instanceof L.Marker &&
        layer.options.icon.options.iconUrl === null
      ) {
        const customIcon = createCustomIcon(warna);
        layer.setIcon(customIcon).openPopup();
        layer["isText"] = true;
      }
      newWarna = warna;
      console.log(newWarna);

      // updateShapeColor(e.layer);
      layer.on("click", function () {
        console.log(e.shape);
        console.log("Current Color:", this.options.color);
        // const newColor = document.getElementById('color-picker').value;
        // const newopacity = document.getElementById('opacity-pick').value;

        const newopacity = colorPickerControlRef.current.getSliderValue();

        // console.log('New Color:', newColor);
        // console.log('newopacity', newopacity);

        // Check if the clicked layer is a polygon
        if (
          layer instanceof L.Polygon ||
          layer instanceof L.Circle ||
          layer instanceof L.Polyline
        ) {
          layer.setStyle({ fillOpacity: newopacity });
        } else if (
          !(
            this instanceof L.Polygon ||
            this instanceof L.Circle ||
            this instanceof L.Polyline
          ) &&
          this.options.icon.options.iconUrl === null
        ) {
          const customIcon = createCustomIcon(newopacity);
          layer.setIcon(customIcon).openPopup();
        } else {
          console.log("Elemen lain diklik");
        }
      });

      e.layer.on("pm:edit", () => {
        updatePopupContent(e);
        console.log("layer is edited");
      });
    },
  });

  const geographicLibArea = (coordinates) => {
    const geod = geodesic.Geodesic.WGS84;
    let poly = geod.Polygon(false);
    for (let i = 0; i < coordinates.length; ++i) {
      poly.AddPoint(coordinates[i][0], coordinates[i][1]);
    }
    poly = poly.Compute(false, true);
    return Math.abs(poly.area.toFixed(2));
  };

  const calculateDistance = (point1, point2) => {
    const geod = geodesic.Geodesic.WGS84;
    const result = geod.Inverse(point1[0], point1[1], point2[0], point2[1]);
    const distance = result.s12;
    return distance;
  };

  const updatePopupContent = (e) => {
    if (e.shape === "Polygon" || e.shape === "Rectangle") {
      const coordinates = e.layer
        .getLatLngs()[0]
        .map((point) => [
          Number(point.lat.toFixed(5)),
          Number(point.lng.toFixed(5)),
        ]);
      let area = geographicLibArea(coordinates);

      let unit = " m²";
      if (area >= 1000000) {
        area /= 1000000;
        unit = " km²";
      }

      e.layer
        .bindPopup(
          `<b>Shape:</b> ${e.shape}</br>
                 <b>Nodes:</b> ${coordinates.length}</br>
                 <b>Area:</b> ${area.toFixed(2) + unit}</br>`
        )
        .openPopup();
      // e.layer.setStyle({ color: newWarna });
    } else if (e.shape === "Line") {
      const coordinates = e.layer
        .getLatLngs()
        .map((point) => [
          Number(point.lat.toFixed(5)),
          Number(point.lng.toFixed(5)),
        ]);

      let totalDistance = 0;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const startPoint = coordinates[i];
        const endPoint = coordinates[i + 1];
        const segmentDistance = calculateDistance(startPoint, endPoint);
        totalDistance += segmentDistance;
      }

      // console.log("Total Distance:", totalDistance.toFixed(2), "meters");
      let unit = " m";
      if (totalDistance >= 10000) {
        totalDistance /= 1000;
        unit = " km";
      }
      e.layer
        .bindPopup(
          `<b>Shape:</b> ${e.shape}</br>
                 <b>Distance:</b> ${totalDistance.toFixed(2) + unit}`
        )
        .openPopup();
      // e.layer.setStyle({ color: newColor });
      // console.log(coordinates)
    } else if (e.shape === "Circle") {
      let radius = e.layer.getRadius();
      let area = Math.PI * radius * radius;
      let areaUnit = " m²";
      if (area >= 1000000) {
        area /= 1000000;
        areaUnit = " km²";
      }
      e.layer
        .bindPopup(
          `<b>Shape:</b> ${e.shape}</br>
                 <b>Radius:</b> ${radius.toFixed(2)} m</br>
                 <b>Area:</b> ${area.toFixed(2) + areaUnit}`
        )
        .openPopup();
      // e.layer.setStyle({ color: newColor });
    } else if (e.shape === "Marker") {
      const customIcon = createCustomIcon(newWarna);
      e.layer.setIcon(customIcon).openPopup();
      console.log(e.layer);
    }
  };

 var elementToRemove = document.querySelector("#root > div > div > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-marker-pane > img");
if (elementToRemove) {
    elementToRemove.remove();
} else {
    console.log("Element not found.");
} 

return null;





};

