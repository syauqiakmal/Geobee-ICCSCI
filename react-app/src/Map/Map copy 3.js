import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, ScaleControl } from "react-leaflet";
import { GeomanToolbar } from "../layers/Geoman";
import { ShowCoordinates } from "../layers/ShowCoordinates";
import { ContinentsPolygonLayer } from "../layers/ContinentLayer";
import Search from "./search";
import { continents } from "../data/indo_provinces";
import Menu from "./componentmap";
import shp from 'shpjs';

export const Map = () => {
  const [selectedOption, setSelectedOption] = useState("OSM");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContinentsVisible, setIsContinentsVisible] = useState(false);
  const [geojsonData, setGeojsonData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isContinentsCheckboxEnabled, setIsContinentsCheckboxEnabled] = useState(true);
  const [isUploadCheckboxEnabled, setIsUploadCheckboxEnabled] = useState(true);
  const mapRef = useRef(null);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleToggleContinents = () => {
    setIsContinentsVisible(!isContinentsVisible);
  };

  const handleShowFile = (index, checked) => {
    const updatedFiles = uploadedFiles.map((file, i) => {
      if (i === index) {
        return { ...file, checked: checked };
      } else {
        return { ...file, checked: false }; // Hanya satu file yang bisa dipilih sekaligus
      }
    });
    setUploadedFiles(updatedFiles);
    const selectedFiles = updatedFiles.filter((file) => file.checked);
    const combinedData = selectedFiles.map((file) => file.data); // Gabungkan data geometri dari semua file yang dipilih
    const mergedGeojsonData = {
      type: "FeatureCollection",
      features: combinedData.flatMap((data) => data.features),
    };
    if (selectedFiles.length > 0) {
      setGeojsonData(mergedGeojsonData);
    } else {
      setGeojsonData(null);
    }
  };

  const handleShapefileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      console.error("File must be a zip file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      try {
        const data = await shp(arrayBuffer);
        const geojsonData = {
          type: "FeatureCollection",
          features: data.features.map((feature) => ({
            type: "Feature",
            geometry: feature.geometry,
            properties: feature.properties,
          })),
        };

        const newUploadedFile = {
          name: file.name,
          data: geojsonData,
          checked: true, // Automatically checked after upload
        };

        setUploadedFiles([...uploadedFiles, newUploadedFile]);
        setIsMenuOpen(true); // Open menu after uploading file
        setGeojsonData(geojsonData);

        // Zoom to the newly uploaded file's bounds
        if (mapRef.current) {
          const layer = new GeoJSON(geojsonData);
          mapRef.current.fitBounds(layer.getBounds());
        }
      } catch (error) {
        console.error("Error reading shapefile:", error);
      }
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
    };
    reader.readAsArrayBuffer(file);
  };

  const getFeatureStyle = (feature) => {
    return {
      color: feature.properties.color || "blue",
      weight: 2,
      fillOpacity: 0.2,
    };
  };

  const position = [-2.483383, 117.890285];

  return (
    <div className="container">
      <MapContainer
        ref={mapRef}
        center={position}
        zoom={5}
        style={{ width: "100%", height: "97vh" }}
        minZoom={3}
        maxBounds={[
          [-90, -180], // Batas sudut barat daya
          [90, 180]    // Batas sudut timur laut
        ]}
      >
        <Menu
          selectedOption={selectedOption}
          handleOptionChange={handleOptionChange}
          isMenuOpen={isMenuOpen}
          handleMenuToggle={handleMenuToggle}
          isContinentsVisible={isContinentsVisible}
          handleToggleContinents={handleToggleContinents}
          uploadedFiles={uploadedFiles}
          handleShowFile={handleShowFile}
          handleShapefileUpload={handleShapefileUpload}
          isContinentsCheckboxEnabled={isContinentsCheckboxEnabled}
          isUploadCheckboxEnabled={isUploadCheckboxEnabled}
        />

        <Search />
        {selectedOption === "OSM" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {selectedOption === "Imagery" && (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        )}
        {selectedOption === "Topo" && (
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          />
        )}
        {isContinentsVisible && <ContinentsPolygonLayer data={continents} />}
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            style={getFeatureStyle} // Apply style here
          />
        )}
        <ScaleControl position="bottomright" imperial={true} />
        <GeomanToolbar />
        <ShowCoordinates />
      </MapContainer>
    </div>
  );
};
