import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import './geojson-looker.css'
import { LatLngExpression } from 'leaflet'


import L from 'leaflet'

// import icon from 'leaflet/dist/images/marker-icon.png'
// import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', // icon,
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'// iconShadow
})

L.Marker.prototype.options.icon = DefaultIcon

// Marker issues: https://github.com/PaulLeCam/react-leaflet/issues/453#issuecomment-731732137

const map_options = {
    'standard': {
        'tiles_url': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'metadata': {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
        }
    },
    'satellite': {
        'tiles_url': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        'metadata': {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
    },
    'topographic': {
        'tiles_url': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        'metadata': {
            maxZoom: 17,
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }
    },
    'watercolour': {
        'tiles_url': 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}',
        'metadata': {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'jpg'
        }
    },
    'toner_lite': {
        'tiles_url': 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}',
        'metadata': {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        },
    },
    'historic': {
        'tiles_url': 'https://nls-{s}.tileserver.com/nls/{z}/{x}/{y}.jpg',
        'metadata': {
            attribution: '<a href="http://geo.nls.uk/maps/">National Library of Scotland Historic Maps</a>',
            bounds: [[49.6, -12], [61.7, 3]],
            minZoom: 1,
            maxZoom: 18,
            subdomains: '0123'
        }
    },
}



const Geojson = (props) => {
  console.log('Geojson() props', props)
  const position: LatLngExpression = [51.505, -0.09]
  return (
    <>
      {console.log('Geojson Component')}
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ width: '100%', height: '900px'}}>
        <TileLayer
          attribution={map_options[props.mapStyle].metadata.attribute}
          url={map_options[props.mapStyle].tiles_url}
        />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </>
  )
}

export default Geojson