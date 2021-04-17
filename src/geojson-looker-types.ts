import { VisData } from './types'

export interface GeoVisModel {
  dimensions: Array<any>,
  measures: Array<any>,
  data: VisData,
  ranges: { [index: string]: any }
}

export interface GeoVisConfig {

}