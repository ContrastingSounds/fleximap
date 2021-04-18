import vegaEmbed from 'vega-embed'

let vegaLiteSpecification: any = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 800,
  "height": 500,
  "projection": {
    "type": "albersUsa"
  },
  "layer": [
    {
      "data": {
        "url": "https://storage.googleapis.com/jeff-308116-media/us-states.geojson",
      },
      "mark": {
        "type": "geoshape",
        "fill": "lightgray",
        "stroke": "white"
      }
    }
  ]
}

const buildVegaLiteMap = function(elem, config, model) {
  // vegaLiteSpecification.data = { "values": model.data} 
  vegaLiteSpecification.height = elem.clientHeight
  vegaLiteSpecification.width = elem.clientWidth
    
  let vegaConfig: any = {
    'actions': false
  }

  vegaEmbed(elem, vegaLiteSpecification, vegaConfig).catch(console.warn)
}

export default buildVegaLiteMap