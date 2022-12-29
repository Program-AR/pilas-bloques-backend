import * as mongoose from 'mongoose'
import { Schema } from 'mongoose'


//// TYPES 
// TODO: https://www.npmjs.com/package/@typegoose/typegoose
export type DocumentOf<T> = FromFields<T> & mongoose.Document

type FromFields<T extends Record<any, any>> = {
  [Key in Fields<T>]:
  any extends T[Key]['type']
  ? FromFields<T[Key]>
  : FieldType<T[Key]>

}

type Fields<T> = {
  [K in keyof T]: FieldType<T[K]> extends never ? never : K
}[keyof T]


type FieldType<T extends { type?: any }> =
  T['type'] extends typeof Schema.Types.ObjectId
  ? never
  : T['type'] extends typeof Schema.Types.Mixed
  ? any
  : InstanceType<T['type']>


export type Nullable<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>