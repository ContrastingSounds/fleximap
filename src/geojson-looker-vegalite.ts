import vegaEmbed from 'vega-embed'
import { isLookup } from 'vega-lite/build/src/transform'

let vegaLiteSpec: any = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  // "layer": [],
}

const buildVegaLiteMap = function(element, config, model) {
  vegaLiteSpec.data = {
    "url": model.data[0][config.regionLayer],
    "format": {"property": "features"},
  }
  vegaLiteSpec.projection = {
    'type': model.data[0][config.projection]
  }
  vegaLiteSpec.datasets = {
    'looker': model.data
  }

  vegaLiteSpec.layer = [
    {
      "mark": {
        "type": "geoshape",
        "fill": "lightgrey",
        "stroke": "white"
      }
    },
    {
      "mark": {
        "type": "geoshape",
        "stroke": "white"
      },
      "transform": [
        {
          'lookup': 'properties.' + model.data[0][config.regionMapKey], 
          'from': {
            'data': { 'name': 'looker' },
            'key': config.regionDataKey,
            'fields': [config.colorBy],
          }
        }
      ],
      "encoding": {
        "color": {
          "field": config.colorBy,
          "type": "quantitative",
        },
        "tooltip": [
          {"field": "properties.name", "type": "nominal", "title": "Name"},
          {"field": "properties.region", "type": "nominal", "title": "Region"},
          {"field": config.colorBy, "type": "quantitative", "title": config.colorBy}
        ]
      }
    }
  ]

  vegaLiteSpec.height = element.clientHeight
  vegaLiteSpec.width = element.clientWidth
    
  let vegaConfig: any = {
    'actions': false
  }
  console.log('vegaLiteSpec', vegaLiteSpec)
  vegaEmbed(element, vegaLiteSpec, vegaConfig).catch(console.warn)
}

export default buildVegaLiteMap