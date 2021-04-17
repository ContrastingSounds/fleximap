import React from "react"
import ReactDOM from "react-dom"

import {
  Looker,
  VisualizationDefinition,
  VisOptions
} from './types'

import Geojson from './geojson-looker'

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
    this.chart = ReactDOM.render(<div />, element)
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // ERROR HANDLING
    this.clearErrors()

    console.log('data:', data)
    console.log('config:', config)
    console.log('queryResponse:', queryResponse)

    console.log('Ready to render vis')
    this.chart = ReactDOM.render(
      <Geojson
        mapStyle={config.mapStyle}
        layerType={config.layerType}
        width={element.clientWidth}
        height={element.clientHeight}
      />,
      element
    )
  }
}

looker.plugins.visualizations.add(vis)