import vegaEmbed from 'vega-embed'

let vegaLiteSpec: any = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  layer: []
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

  let regions = {
    "mark": {
      "type": "geoshape",
      "fill": "lightgrey",
      "stroke": "white"
    }
  }
  vegaLiteSpec.layer.push(regions)

  let shading = {
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
          'fields': [config.colorBy, config.sizeBy],
        }
      }
    ],
    "encoding": {
      "color": {
        "field": config.colorBy,
        "type": "quantitative",
        // https://vega.github.io/vega/docs/schemes/#scheme-properties
        "scale": { "scheme": config.colorScheme }
      },
      "tooltip": [
        {"field": "properties.name", "type": "nominal", "title": "Name"},
        {"field": "properties.region", "type": "nominal", "title": "Region"},
        {"field": config.colorBy, "type": "quantitative", "title": config.colorBy}
      ]
    }
  }
  vegaLiteSpec.layer.push(shading)

  let labels = {
    "mark": {
      "type": "text",
    },
    "transform": [
      {
        "calculate": "geoCentroid(null, datum)",
        "as": "centroid"
      },
      {
        "calculate": "datum.centroid[0]",
        "as": "lon"
      },
      {
        "calculate": "datum.centroid[1]",
        "as": "lat"
      }
    ],
    "encoding": {
      "text": {
        "field": "properties." + model.data[0][config.regionMapKey], 
        "type": "nominal"
      },
      "longitude": {
        "field": "lon",
        "type": "quantitative"
      },
      "latitude": {
        "field": "lat",
        "type": "quantitative"
      }
    }
  }
  vegaLiteSpec.layer.push(labels)
    
  let vegaConfig: any = {
    'actions': false,
  }
  console.log('vegaLiteSpec', vegaLiteSpec)

  vegaLiteSpec.height = element.clientHeight
  vegaLiteSpec.width = element.clientWidth
  vegaLiteSpec.autosize = { "type": "fit" }

  vegaEmbed(element, vegaLiteSpec, vegaConfig).catch(console.warn)
}

export default buildVegaLiteMap