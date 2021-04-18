import { VisData } from './types'

export interface GeoVisModel {
  dimensions: Array<any>,
  measures: Array<any>,
  data: VisData,
  ranges: { [index: string]: any }
}

export interface GeoVisConfig {
  visType: string,
  mapStyle: string,
  layerType: string,
  regionLayer: string,
  regionKey: string,
  regionProperty: string,
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