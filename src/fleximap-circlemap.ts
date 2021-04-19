import { parse, View} from 'vega' 
import vegaEmbed from 'vega-embed'
// import VisualizationSpec from 'vega-typings'
interface VisualizationSpec {
  [index: string] : any  
}

const buildCircleMap = function(element, config, model) {
  let vegaSpec: VisualizationSpec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "Convert regions and points to circles",
    "height": element.clientHeight,
    "width": element.clientWidth,
    "autosize": { "type": "fit" },

    "data": [
      {
        "name": "regions",
        "url": model.data[0][config.regionLayer],
        "format": {"property": "features"},
        "transform": [
          {
            "type": "formula",
            "expr": "geoCentroid('projection', datum)",
            "as": "centroid"
          },
          {
            "type": "formula",
            "expr": "400 + random() * 3000",
            "as": "value"
          },
        ],
      },
      {
        "name": "looker",
        "values": model.data,
        "transform": [
          {
            "type": "lookup",
            "from": "regions", 
            "key": "properties." + model.data[0][config.regionMapKey],
            "fields": ["centroid"], 
            "as": ["centroid"]
          }
        ]
      }
    ],

    "projections": [
      {
        "name": "projection",
        "type": model.data[0][config.projection],
        "scale": 1100,
        "translate": [{"signal": "width / 2"}, {"signal": "height / 2"}]
      }
    ],

    "scales": [
      {
        "name": "size",
        "domain": {"data": "regions", "field": "value"},
        "zero": false,
        "range": [1000, 4000]
      },
      {
        "name": "color",
        "type": "linear",
        "nice": true,
        "domain": {"data": "regions", "field": "value"},
        "range": "ramp"
      }
    ],

    "marks": [
      {
        "name": "circles",
        "type": "symbol",
        "from": {"data": "regions"},

        "transform": [
          {
            "type": "force",
            "static": true,
            "forces": [
              {"force": "collide", "radius": {"expr": "1 + sqrt(datum.size) / 2"}},
              {"force": "x", "x": "datum.centroid[0]"},
              {"force": "y", "y": "datum.centroid[1]"}
            ]
          }
        ],

        "encode": {
          "enter": {
            "size": {"scale": "size", "field": "value"},
            "fill": {"scale": "color", "field": "value"},
            "stroke": {"value": "white"},
            "strokeWidth": {"value": 1.5},
            "x": {"field": "centroid[0]"},
            "y": {"field": "centroid[1]"},
            "tooltip": {"signal": "{'Name': datum.properties.name, 'Region': datum.properties.region, 'Value': datum.value}"},
          }
        },
      },
      {
        "name": "text",
        "type": "text",
        "interactive": false,
        "from": {"data": "circles"},
        "encode": {
          "enter": {
            "align": {"value": "center"},
            "baseline": {"value": "middle"},
            "fontSize": {"value": 10},
            "fontWeight": {"value": "bold"},
            "text": {"field": "datum.properties.postal"}, 
          },
          "update": {
            "x": {"field": "x"},
            "y": {"field": "y"}
          }
        }
      }
    ]
  }
      
  let vegaConfig: any = {
    'actions': false,
  }
  console.log('vegaSpec', vegaSpec)
  
  let runtime = parse(vegaSpec)
  console.log('runtime', runtime)

  let view = new View(runtime)
  view.run()
  console.log('view', view)
  // @ts-ignore: accessing private debug object
  console.log('view._runtime.data.regions', view._runtime.data.regions)
  // @ts-ignore: accessing private debug object
  console.log('view._runtime.data.looker', view._runtime.data.looker)

  console.log('view.description()', view.description())
  console.log('view.getState()', view.getState())
  console.log('view.scenegraph()', view.scenegraph())
  
  // @ts-ignore: accessing private debug object
  console.log('view._runtime.data', view._runtime.data)
  console.log('view.data regions', view.data('regions'))
  console.log('view.data looker', view.data('looker'))

  vegaEmbed(element, vegaSpec, vegaConfig).catch(console.warn)
}

export default buildCircleMap