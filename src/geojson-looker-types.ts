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
  colorBy: string,
  groupBy: string,
  sizeBy: string,
  scale: number
}