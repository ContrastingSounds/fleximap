import {
  Looker,
  VisualizationDefinition,
} from './types'

import { GeoVisModel, GeoVisConfig } from './geojson-looker-types'
import { getDimensions, getMeasures, getConfigOptions, getDataAndRanges } from './geojson-looker-model'
import buildLeafletMap from './geojson-looker-leaflet'
import buildVegaLiteMap from './geojson-looker-vegalite'
import buildCircleMap from './geojson-looker-circlemap'

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
      visType: config.visType,
      mapStyle: config.mapStyle,
      layerType: config.layerType,
      projection: config.projection,

      regionLayer: config.regionLayer,
      regionDataKey: config.regionDataKey,
      regionMapKey: config.regionMapKey,
      colorScheme: config.colorScheme,
      
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
    let map_element = document.getElementById('geojsonMap')
    if (map_element) {
        map_element.parentNode!.removeChild(map_element);
    }

    map_element = element.appendChild(document.createElement("div"))
    map_element!.id = "geojsonMap"
    map_element!.setAttribute("style", "height: 100%")

    switch (config.visType) {
      case 'leaflet':
        buildLeafletMap(map_element, visConfig, geoVisModel)
        break
      
      case 'vegaLite':
        buildVegaLiteMap(map_element, visConfig, geoVisModel)
        break

      case 'circleMap':
        buildCircleMap(map_element, visConfig, geoVisModel)
        break
    }
    
  }
}

looker.plugins.visualizations.add(vis)