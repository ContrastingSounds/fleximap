import React from "react"
import ReactDOM from "react-dom"

import {
  Looker,
  VisualizationDefinition
} from './types'

import Geojson from './geojson-looker'

// Global values provided via the API
declare var looker: Looker


const vis: VisualizationDefinition = {
  options: {},

  create: function(element, config) {
    this.chart = ReactDOM.render(<div />, element)
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // ERROR HANDLING
    this.clearErrors()

    this.chart = ReactDOM.render(
      <Geojson></Geojson>,
      element
    )
  }
}

looker.plugins.visualizations.add(vis)