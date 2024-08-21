import L from 'leaflet';

export const createCustomIcon = (newColor, opacity, iconSize = [35, 41]) => {
    const iconHtml = `
        <div style="display: flex; justify-content: center; align-items: center;">
            <i class="fas fa-map-marker-alt" style="color: ${newColor}; opacity:${opacity}; font-size: 10px;"></i>
        </div>`;
    return L.divIcon({
        className: 'custom-icon',
        html: iconHtml,
        iconSize: iconSize,
    });
};