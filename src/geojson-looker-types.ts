import { VisData } from './types'

export interface GeoVisModel {
  dimensions: Array<any>,
  measures: Array<any>,
  data: VisData,
  ranges: { [index: string]: any }
}

export interface GeoVisConfig {
  mapStyle: string,
  layerType: string,
  regionLayer: string,
  pointLayer: string,
  colorBy: string,
  groupBy: string,
  sizeBy: string,
  scale: number
}

export interface GeoJsonLayer {
  type: 'region' | 'point',
  style: (any) => any,
  value: string
}