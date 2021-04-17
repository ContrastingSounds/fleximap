import {
  Looker,
  VisualizationDefinition,
} from './types'

import { GeoVisModel, GeoVisConfig } from './geojson-looker-types'
import { getDimensions, getMeasures, getConfigOptions, getDataAndRanges } from './geojson-looker-model'
import buildLeafletMap from './geojson-looker-leaflet'

// Global values provided via the API
declare var looker: Looker


const vis: VisualizationDefinition = {
  options: {}, // default_options,

  create: function(element, config) {
    this.container = element.appendChild(document.createElement("div"))
    this.container.id = "geojsonMap"

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
      regionLayer: config.regionLayer,
      regionKey: config.regionKey,
      regionProperty: config.regionProperty,
      pointLayer: config.pointLayer,
      colorBy: config.colorBy,
      groupBy: config.groupBy,
      sizeBy: config.sizeBy,
      scale: config.scale
    }

    this.trigger('registerOptions', getConfigOptions(geoVisModel))
    getDataAndRanges(data, visConfig, geoVisModel)
    console.log('geoVisModel:', geoVisModel)

    // MAP
    buildLeafletMap(element, visConfig, geoVisModel)
  }
}

looker.plugins.visualizations.add(vis)