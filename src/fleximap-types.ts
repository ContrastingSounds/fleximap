import { VisData } from './types'

export interface GeoVisModel {
  dimensions: Array<any>,
  measures: Array<any>,
  data: Array<any>,
  ranges: { [index: string]: any }
}

export interface GeoVisConfig {
  visType: string,
  mapStyle: string,
  layerType: string,
  projection: string,

  regionLayer: string,
  regionDataKey: string,
  regionMapKey: string,
  colorScheme: string,

  pointLayer: string,

  colorBy: string,
  groupBy: string,
  sizeBy: string,
  scale: number
}

export interface GeoJsonLayer {
  type: 'region' | 'point',
  value: string
}