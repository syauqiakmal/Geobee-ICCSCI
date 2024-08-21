import React from "react";
import logo from "../Logo/Logo Geobee Geodashboard.png";

const Menu = ({
  selectedOption,
  handleOptionChange,
  isMenuOpen,
  handleMenuToggle,
  isContinentsVisible,
  handleToggleContinents,
  uploadedFiles,
  handleShowFile,
  handleShapefileUpload,
  isContinentsCheckboxEnabled,
  isUploadCheckboxEnabled,
}) => {
  return (
    <div className="dashboard-menu" style={{ zIndex: 1000 }}>
      <input
        type="checkbox"
        id="dashboard-toggle"
        className="dashboard-toggle"
        checked={isMenuOpen}
        onChange={handleMenuToggle}
      />
      <label htmlFor="dashboard-toggle" className="dashboard-icon">
        <div className="strip"></div>
        <div className="strip"></div>
        <div className="strip"></div>
      </label>
      <hr className="divider-vertical" /> {/* Pembatas */}
      <div className="menu-logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className={`dashboard-links ${isMenuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <label
              className="nameMenu"
              style={{ display: "flex", alignItems: "center" }}
            >
              <input
                type="radio"
                name="mapOption"
                value="OSM"
                checked={selectedOption === "OSM"}
                onChange={() => handleOptionChange("OSM")}
              />
              <p>OSM Street</p>
            </label>
          </li>
          <li>
            <label
              className="nameMenu"
              style={{ display: "flex", alignItems: "center" }}
            >
              <input
                type="radio"
                name="mapOption"
                value="Imagery"
                checked={selectedOption === "Imagery"}
                onChange={() => handleOptionChange("Imagery")}
              />
              <p> ESRI World Imagery</p>
            </label>
          </li>
          <li>
            <label
              className="nameMenu"
              style={{ display: "flex", alignItems: "center" }}
            >
              <input
                type="radio"
                name="mapOption"
                value="Topo"
                checked={selectedOption === "Topo"}
                onChange={() => handleOptionChange("Topo")}
              />
              <p>Topography Map</p>
            </label>
          </li>
          <hr className="divider" /> {/* Pembatas */}
          <li className="shapefile">
          <div class="checkbox-wrapper-21">
                <label class="control control--checkbox">
                  <input
                  
                type="checkbox"
                name="continents"
                checked={isContinentsVisible}
                onChange={handleToggleContinents}
                disabled={!isContinentsCheckboxEnabled}
              />
              Show Continents
              <div class="control__indicator"></div>
            </label>
            </div>
          </li>
          {uploadedFiles.map((file, index) => (
            <li key={index}>
              <div class="checkbox-wrapper-21">
                <label class="control control--checkbox">
                  <input
                    type="checkbox"
                    checked={file.checked}
                    onChange={(e) => handleShowFile(index, e.target.checked)}
                  />
                  {file.name}
                  <div class="control__indicator"></div>
                </label>
              </div>
            </li>
          ))}
          <li>
            <label>
              <input
                type="file"
                id="shapefileInput"
                accept=".zip"
                onClick={(e) => (e.target.value = null)}
                onChange={handleShapefileUpload}
                disabled={!isUploadCheckboxEnabled}
              />
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Menu;
