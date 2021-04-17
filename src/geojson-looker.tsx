import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './geojson-looker.css'

import {
  Looker,
  VisualizationDefinition,
  VisOptions
} from './types'

import { map_options } from './geojson-looker-model'

// Global values provided via the API
declare var looker: Looker

const default_options: VisOptions = {
  mapStyle: {
    section: "Map",
    type: "string",
    label: "Map Style",
    display: "select",
    values: [
      {"Standard": "standard"},
      {"Satellite": "satellite"},
      {"Topographic": "topographic"},
      {"Watercolour": "watercolour"},
      {"Toner Lite": "toner_lite"},
      {"Historic (UK Only)": "historic"},
    ],
    default: "standard",
    order: 1
  },
  layerType: {
    section: "Map",
    type: 'string',
    label: 'Layer Type',
    display: 'select',
    values: [
      {'Map file': 'map_file'},
      {'GeoJSON field': 'geojson_field'},
      {'Location Points': 'location_points'},
    ],
    default: 'map_file',
    order: 2
  }
}

const vis: VisualizationDefinition = {
  options: default_options,

  create: function(element, config) {
    this.container = element.appendChild(document.createElement("div"))
    this.container.id = "leafletMap"

    this.tooltip = element.appendChild(document.createElement("div"))
    this.tooltip.id = "tooltip"
    this.tooltip.className = "tooltip"
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // ERROR HANDLING
    this.clearErrors()

    console.log('data:', data)
    console.log('config:', config)
    console.log('queryResponse:', queryResponse)

    let map_element = document.getElementById('leafletMap')
    if (map_element) {
        map_element.parentNode!.removeChild(map_element);
    }
    map_element = element.appendChild(document.createElement("div"))
    map_element.id = "leafletMap"
    map_element.setAttribute("style","height:" + element.clientHeight + "px")

    var map = L.map('leafletMap').setView([51.505, -0.09], 13)
    
    L.tileLayer(
        map_options[config.mapStyle].tiles_url, 
        map_options[config.mapStyle].metadata
    ).addTo(map);
  }
}

looker.plugins.visualizations.add(vis)