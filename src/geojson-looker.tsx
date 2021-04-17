import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './geojson-looker.css'

import {
  Looker,
  VisualizationDefinition,
} from './types'

import { GeoVisModel, GeoVisConfig } from './geojson-looker-types'

import { map_options, getDimensions, getMeasures, getConfigOptions, getDataAndRanges } from './geojson-looker-model'

// Global values provided via the API
declare var looker: Looker


const vis: VisualizationDefinition = {
  options: {}, // default_options,

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

    // MODEL
    let geoVisModel: GeoVisModel = {
      dimensions: [],
      measures: [],
      data: [],
      ranges: {}
    }

    getDimensions(queryResponse, geoVisModel)
    getMeasures(queryResponse, geoVisModel)
    getConfigOptions(geoVisModel)
    
    // CONFIG
    var visConfig: GeoVisConfig = {
      mapStyle: config.mapStyle,
      layerType: config.layerType,
      colorBy: config.colorBy,
      groupBy: config.groupBy,
      sizeBy: config.sizeBy,
      scale: config.scale
    }

    this.trigger('registerOptions', getConfigOptions(geoVisModel))
    getDataAndRanges(data, visConfig, geoVisModel)
    console.log('geoVisModel:', geoVisModel)

    // MAP
    let map_element = document.getElementById('leafletMap')
    if (map_element) {
        map_element.parentNode!.removeChild(map_element);
    }
    map_element = element.appendChild(document.createElement("div"))
    map_element.id = "leafletMap"
    map_element.setAttribute("style","height:" + element.clientHeight + "px")

    var map = L.map('leafletMap').setView([51.505, -0.09], 13)
    
    if (config.mapStyle) {
      L.tileLayer(
        map_options[config.mapStyle].tiles_url, 
        map_options[config.mapStyle].metadata
      ).addTo(map);
    }

  }
}

looker.plugins.visualizations.add(vis)