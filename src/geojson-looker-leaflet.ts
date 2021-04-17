// https://storage.googleapis.com/jeff-308116-media/countries.geojson
// https://storage.googleapis.com/jeff-308116-media/us-states.geojson

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { interpolateViridis } from 'd3-scale-chromatic'

import { GeoVisModel, GeoVisConfig, GeoJsonLayer } from './geojson-looker-types'

import './geojson-looker.css'

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

const removeUndefinedFeatures = true

const addGeoJson = async (layerConfig: GeoJsonLayer, map: any, model: GeoVisModel, config: GeoVisConfig) => {
  const response = await fetch(layerConfig.value)
  const data = await response.json()
  const range = model.ranges[config.colorBy]

  const getColor = (value) => {
    let color: string
    if (typeof value !== 'undefined') {
      color = interpolateViridis((value - range.min) / range.max)
    } else {
      color = 'white'
    }
    return color
  }

  const getOpacity = (value) => {
    if (typeof value !== 'undefined') {
      return 1
    } else {
      return 0
    }
  }

  const styleRegion = (feature: any): any => {
    return {
      fillColor: getColor(feature.properties.lookerValue),
      fillOpacity: getOpacity(feature.properties.lookerValue),
  
      color: 'grey',
      weight: 2,
      opacity: 0,
      dashArray: '3',
    }
  }

  data.features.forEach((feature: any, idx: number): void => {
    let dimension = config.regionKey
    let property = model.data[0][config.regionProperty].value
    let currentKey = feature.properties[property]
    let dataRow = model.data.find(row => row[dimension].value === currentKey)

    if (typeof dataRow !== 'undefined') {
      feature.properties.lookerValue = dataRow[config.colorBy].value
      feature.properties.lookerLinks = dataRow[config.colorBy].links
      feature.properties.lookerLabel = 'Looker Label'
    } else {
      if (removeUndefinedFeatures) {
        data.features.splice(idx, 1)
      } else {
        feature.properties.lookerValue = undefined
        feature.properties.lookerLinks = undefined
        feature.properties.lookerLabel = undefined
      }
    }
  })

  let layer = L.geoJSON(data, { style: styleRegion }).addTo(map)
  console.log('getBounds()', layer.getBounds())
  map.fitBounds(layer.getBounds(), { padding: [0, 0] })
}

const buildLeafletMap = (element: any, config: GeoVisConfig, model: GeoVisModel): void => {
  let map_element = document.getElementById('geojsonMap')
  if (map_element) {
      map_element.parentNode!.removeChild(map_element);
  }
  map_element = element.appendChild(document.createElement("div"))
  map_element!.id = "geojsonMap"
  map_element!.setAttribute("style", "height: 100%")

  let mapOptions = {
    attributionControl: false,
    zoomSnap: 0.1,
  }
  let map = L.map('geojsonMap', mapOptions)

  if (config.mapStyle) {
    L.tileLayer(
      map_options[config.mapStyle].tiles_url, 
      map_options[config.mapStyle].metadata
    ).addTo(map)

    let layerConfig: GeoJsonLayer = {
      type: 'region',
      value: model.data[0][config.regionLayer].value
    }
    addGeoJson(layerConfig, map, model, config)
  }
}

export default buildLeafletMap