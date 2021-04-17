/**
 * GeoJSON Vis Model
 * 
 * Each data visualisation has varying data requirements, which will vary from the raw objects
 * provided by the Looker plugin framework (or Looker API if using API calls)
 */

import { VisConfig, VisConfigValue, VisData, VisOptions, VisQueryResponse } from './types'
import { GeoVisModel } from './geojson-looker-types'

export const default_options: VisOptions = {
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

export const map_options = {
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


const getDimensions = (queryResponse: VisQueryResponse, visModel) => {
  queryResponse.fields.dimension_like.forEach(dimension => {
    const field_updates = {
      label: dimension.label_short || dimension.label,
      view: dimension.view_label || '',
    }
    
    dimension = {...dimension, ...field_updates}
    visModel.dimensions.push(dimension)
    visModel.ranges[dimension.name] = { set: [] }
  })
}

const getMeasures = (queryResponse: VisQueryResponse, visModel: GeoVisModel) => {
  queryResponse.fields.measure_like.forEach(measure => {
    const field_updates = {
      label: measure.label_short || measure.label,
      view: measure.view_label || '',
      is_table_calculation: typeof measure.is_table_calculation !== 'undefined',
      is_row_total: false,
      is_pivoted: queryResponse.pivots.length > 0,
      is_super: false,
    }
    
    measure = {...measure, ...field_updates}
    visModel.measures.push(measure) 
    visModel.ranges[measure.name] = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY,
    }

    if (queryResponse.has_row_totals) {
      visModel.measures.push({
        name: '$$$_row_total_$$$.' + measure.name,
        field_name: measure.name,
        label: (measure.label_short || measure.label) + ' (Row Total)', 
        view: measure.view_label || '',
        is_table_calculation: false, // table calcs aren't included in row totals
        is_row_total: true,
        is_pivoted: false,
        is_super: false
      }) 
  
      visModel.ranges['$$$_row_total_$$$.' + measure.name] = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      }     
    }
  })
}

const getConfigOptions = function(model) {
  const { pivot_fields, dimensions, measures } = model

  var visOptions = {
    scale: {
      section: ' Visualization',
      type: 'number',
      display: 'range',
      label: 'Scale Size By',
      default: 1.0,
      min: 0.2,
      max: 2.0,
      step: 0.2,
      order: 100000,
    }
  }

  // sizeBy
  var sizeByOptions: Array<VisConfigValue> = [];
  measures.forEach(measure => {
      var option: VisConfigValue = {};
      option[measure.label] = measure.name;
      sizeByOptions.push(option);
  })

  visOptions["sizeBy"] = {
      section: " Visualization",
      type: "string",
      label: "Size By",
      display: "select",
      values: sizeByOptions,
      default: "0",
      order: 300,
  }

  // colorByOptions include:
  // - by dimension
  // - by pivot key (which are also dimensions)
  // - by pivot series (one color per column)
  var colorByOptions: Array<VisConfigValue> = [];

  dimensions.forEach(dimension => {
      var option: VisConfigValue = {};
      option[dimension.label] = dimension.name;
      colorByOptions.push(option)
  })

  visOptions["colorBy"] = {
    section: " Visualization",
    type: "string",
    label: "Color By",
    display: "select",
    values: colorByOptions,
    default: "0",
    order: 100,
  } 

  return visOptions
}

/**
 * 
 * @param {*} data 
 * @param {*} config 
 * @param {*} visModel 
 * 
 * The vis requires an object per circle (in data terms, one observation per data point)
 * - For a FLAT table (no pivots), or PIVOTED table charting a ROW TOTAL or SUPERMEASURE, that's one object per row
 * - For pivoted measures, the data needs to be converted to a TIDY data set
 *    - Each pivot value can be treated as additional dimension(s)
 *    - The raw data structure therefore contains one cell per row per pivot value
 * 
 * - in future, colorBy could also be a measure. If so, color & size will both need to be sync on measure vs supermeasure
 * 
 * ObservationId
 * - if flat or pivoted, concat dimensions
 * - if tidy, concat dimensions + pivot_key
 * 
 */
const getDataAndRanges = (data: VisData, visConfig: VisConfig, visModel: GeoVisModel) => {
  const sizeByField = visModel.measures.find(measure => measure.name === visConfig.sizeBy)

  data.forEach(row => {
    // Set unique identifier per observation
    // row.observationId = visModel.dimensions.map(dimension => row[dimension.name].value).join('|')

    // Update ranges for dimensions
    visModel.dimensions.forEach(dimension => {
      var current_set = visModel.ranges[dimension.name].set
      var row_value = row[dimension.name].value

      if (current_set.indexOf(row_value) === -1) {
        current_set.push(row_value)
      }
    })

    // Update ranges for measures
    visModel.measures.forEach(measure => {
      if (measure.is_row_total) {
        row[measure.name] = row[measure.field_name]['$$$_row_total_$$$']
      }

      var current_min = visModel.ranges[measure.name].min
      var current_max = visModel.ranges[measure.name].max

      var row_value = measure.is_row_total 
        ? row[measure.field_name]['$$$_row_total_$$$'].value 
        : row[measure.name].value

      visModel.ranges[measure.name].min = Math.min(current_min, row_value)
      visModel.ranges[measure.name].max = Math.max(current_max, row_value)
    })
  })
  visModel.data = data

}

export { getDimensions, getMeasures, getConfigOptions, getDataAndRanges };
