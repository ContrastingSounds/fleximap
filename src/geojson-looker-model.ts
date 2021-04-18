/**
 * GeoJSON Vis Model
 * 
 * Each data visualisation has varying data requirements, which will vary from the raw objects
 * provided by the Looker plugin framework (or Looker API if using API calls)
 */

import { VisConfig, VisConfigValue, VisData, VisOptions, VisQueryResponse } from './types'
import { GeoVisModel } from './geojson-looker-types'

/**
 * Simple function to remove periods from strings
 * Main purpose is to prevent field names including periods from causing an issue
 * 
 * @param field string to sanitize (typically dimension or measure names)
 * @returns 
 */
const sanitize = (field: string): string => field.replace(/\./g, '__')

/**
 * Ensures consistent use of label field
 * @param queryResponse 
 * @param visModel 
 */
const getDimensions = (queryResponse: VisQueryResponse, visModel: GeoVisModel) => {
  queryResponse.fields.dimension_like.forEach(dimension => {
    const field_updates = {
      label: dimension.label_short || dimension.label,
      view: dimension.view_label || '',
    }
    
    dimension = {...dimension, ...field_updates}
    visModel.dimensions.push(dimension)
    visModel.ranges[sanitize(dimension.name)] = { set: [] }
  })
}

const getMeasures = (queryResponse: VisQueryResponse, visModel: GeoVisModel) => {
  queryResponse.fields.measure_like.forEach(measure => {
    const field_updates = {
      label: measure.label_short || measure.label,
      view: measure.view_label || '',
      is_table_calculation: typeof measure.is_table_calculation !== 'undefined',
      is_row_total: false,
      is_super: false,
    }
    
    measure = {...measure, ...field_updates}
    visModel.measures.push(measure) 
    visModel.ranges[sanitize(measure.name)] = {
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
        is_super: false
      }) 
  
      visModel.ranges[sanitize('$$$_row_total_$$$.' + measure.name)] = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY,
      }     
    }
  })
}

const getConfigOptions = function(model: GeoVisModel) {
  const { dimensions, measures } = model

  let visOptions: VisOptions = {
    visType: {
      section: "Map",
      type: "string",
      label: "Vis Type",
      display: "select",
      values: [
        {"Map Tiles (Leaflet)": "leaflet"},
        {"Shapes (Vega Lite)": "vegaLite"},
      ],
      default: "leaflet",
      order: 0
    },
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
    },
    colorScheme: {
      section: "Map",
      type: 'string',
      label: 'Color Scheme',
      display: 'select',
      values: [
        {'Blue': 'lighttealblue'},
        {'Green': 'bluegreen'},
        {'Red': 'orangered'},
        {'Grey': 'greys'}
      ],
      default: 'lighttealblue',
      order: 3
    },
    scale: {
      section: 'Point',
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

  var colorByOptions: Array<VisConfigValue> = []
  var sizeByOptions: Array<VisConfigValue> = []
  measures.forEach(measure => {
      var option: VisConfigValue = {}
      option[measure.label] = sanitize(measure.name)
      colorByOptions.push(option)
      sizeByOptions.push(option)
  })

  visOptions["colorBy"] = {
    section: "Region",
    type: "string",
    label: "Color By",
    display: "select",
    values: colorByOptions,
    default: sanitize(model.measures[0].name),
    order: 10,
  } 

  visOptions["sizeBy"] = {
      section: "Point",
      type: "string",
      label: "Size By",
      display: "select",
      values: sizeByOptions,
      default: sanitize(model.measures[0].name),
      order: 20,
  }

  var regionLayerOptions: Array<VisConfigValue> = []
  var regionDataKeyOptions: Array<VisConfigValue> = []
  var regionMapKeyOptions: Array<VisConfigValue> = []
  var pointLayerOptions: Array<VisConfigValue> = []
  var projectionOptions: Array<VisConfigValue> = []
  dimensions.forEach(dimension => {
      var option: VisConfigValue = {}
      option[dimension.label] = sanitize(dimension.name)
      regionLayerOptions.push(option)
      regionDataKeyOptions.push(option)
      regionMapKeyOptions.push(option)
      pointLayerOptions.push(option)
      projectionOptions.push(option)
  })

  visOptions["regionLayer"] = {
    section: "Region",
    type: "string",
    label: "Region Layer",
    display: "select",
    values: regionLayerOptions,
    default: sanitize(model.dimensions[0].name),
    order: 30,
  } 

  visOptions["regionDataKey"] = {
    section: "Region",
    type: "string",
    label: "Data Key",
    display: "select",
    display_size: 'half',
    values: regionDataKeyOptions,
    default: sanitize(model.dimensions[0].name),
    order: 40,
  } 

  visOptions["regionMapKey"] = {
    section: "Region",
    type: "string",
    label: "Map Key",
    display: "select",
    display_size: 'half',
    values: regionMapKeyOptions,
    default: sanitize(model.dimensions[0].name),
    order: 50,
  } 
  
  visOptions["pointLayer"] = {
      section: "Point",
      type: "string",
      label: "Point Layer",
      display: "select",
      values: pointLayerOptions,
      default: sanitize(model.dimensions[0].name),
      order: 60,
  }

  visOptions["projection"] = {
    section: "Map",
    type: "string",
    label: "Projection",
    display: "select",
    values: projectionOptions,
    default: sanitize(model.dimensions[0].name),
    order: 60,
}

  console.log('visOptions', visOptions)
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
  let jsonData: Array<any> = []
  data.forEach(row => {
    // Set unique identifier per observation
    // row.observationId = visModel.dimensions.map(dimension => row[dimension.name].value).join('|')
    let jsonRow: any = {}

    visModel.dimensions.forEach(dimension => {
      var current_set = visModel.ranges[sanitize(dimension.name)].set
      var row_value = row[dimension.name].value

      // update ranges
      if (current_set.indexOf(row_value) === -1) {
        current_set.push(row_value)
      }

      // update row
      jsonRow[sanitize(dimension.name)] = row_value
    })

    
    visModel.measures.forEach(measure => {
      if (measure.is_row_total) {
        row[measure.name] = row[measure.field_name]['$$$_row_total_$$$']
      }

      // Update ranges for measures
      var current_min = visModel.ranges[sanitize(measure.name)].min
      var current_max = visModel.ranges[sanitize(measure.name)].max

      var row_value = measure.is_row_total 
        ? row[measure.field_name]['$$$_row_total_$$$'].value 
        : row[measure.name].value

      visModel.ranges[sanitize(measure.name)].min = Math.min(current_min, row_value)
      visModel.ranges[sanitize(measure.name)].max = Math.max(current_max, row_value)

      // update row
      jsonRow[sanitize(measure.name)] = row[measure.name].value
    })

    jsonData.push(jsonRow)
  })
  visModel.data = jsonData

}

export { getDimensions, getMeasures, getConfigOptions, getDataAndRanges };
