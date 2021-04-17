// https://storage.googleapis.com/jeff-308116-media/countries.geojson
// https://storage.googleapis.com/jeff-308116-media/us-states.geojson

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { interpolateViridis } from 'd3-scale-chromatic'

import './geojson-looker.css'

import {
  Looker,
  VisualizationDefinition,
} from './types'

import { GeoVisModel, GeoVisConfig, GeoJsonLayer } from './geojson-looker-types'

import { map_options, getDimensions, getMeasures, getConfigOptions, getDataAndRanges } from './geojson-looker-model'

// Global values provided via the API
declare var looker: Looker

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

  data.features.forEach((feature: any): void => {
    let dimension = config.regionKey
    let property = model.data[0][config.regionProperty].value
    let currentKey = feature.properties[property]
    let dataRow = model.data.find(row => row[dimension].value === currentKey)

    if (typeof dataRow !== 'undefined') {
      feature.properties.lookerValue = dataRow[config.colorBy].value
      feature.properties.lookerLinks = dataRow[config.colorBy].links
      feature.properties.lookerLabel = 'Looker Label'
    } else {
      feature.properties.lookerValue = undefined
      feature.properties.lookerLinks = undefined
      feature.properties.lookerLabel = undefined
    }
  })

  let layer = L.geoJSON(data, { style: styleRegion }).addTo(map)
  map.fitBounds(layer.getBounds())
}

// addGeoJson()

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
    let map_element = document.getElementById('leafletMap')
    if (map_element) {
        map_element.parentNode!.removeChild(map_element);
    }
    map_element = element.appendChild(document.createElement("div"))
    map_element.id = "leafletMap"
    map_element.setAttribute("style","height:" + element.clientHeight + "px")

    var map = L.map('leafletMap',{attributionControl: false})
    
    if (config.mapStyle) {
      L.tileLayer(
        map_options[config.mapStyle].tiles_url, 
        map_options[config.mapStyle].metadata
      ).addTo(map)

      let layerConfig: GeoJsonLayer = {
        type: 'region',
        value: geoVisModel.data[0][config.regionLayer].value
      }
      addGeoJson(layerConfig, map, geoVisModel, visConfig)
    }

  }
}

looker.plugins.visualizations.add(vis)