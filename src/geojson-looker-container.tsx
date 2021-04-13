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
  },
}

const vis: VisualizationDefinition = {
  options: default_options,

  create: function(element, config) {
    this.chart = ReactDOM.render(<div />, element)
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // ERROR HANDLING
    this.clearErrors()

    console.log('Ready to render vis')
    this.chart = ReactDOM.render(
      <Geojson
        mapStyle={config.mapStyle}
        width={element.clientWidth}
        height={element.clientHeight}
      />,
      element
    )
  }
}

looker.plugins.visualizations.add(vis)