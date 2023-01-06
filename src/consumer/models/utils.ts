import { modelOptions, prop, Severity } from '@typegoose/typegoose'
import { CompleteSolution as Solution } from '../../models/solution'

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class ThinSolution {
  @prop({_id: false})
  timestamp: Date
  @prop({_id: false})
  executionResult: any
}

// This was removed from mongoose
export interface MapReduceResult<Key, Val> {
  _id: Key;
  value: Val;
}

// INSTANCES
export function initialize<T>(constructor: new () => T, init?: Partial<T>): T {
  return Object.assign(new constructor(), init)
}

function buildSuccess(solution: Solution, executionCount: number, trialsCount: number) {
  return { solution, executionCount, trialsCount, }
}
export interface IntervalTimestamp {
  start: Date
  end: Date
  lapse: number
}

function buildIntervalTimestampFor(this: UtilsBehavior, timestamps: Date[]): IntervalTimestamp {
  const start = timestamps.reduce(this.min)
  const end = timestamps.reduce(this.max)
  return this.buildIntervalTimestamp(start, end)
}

function buildIntervalTimestamp(start: Date, end: Date): IntervalTimestamp {
  return {
    start, end,
    lapse: end.getTime() - start.getTime(),
  }
}

// UTILS

export function assign<T>(target: T, ...values: any[]): T {
  for (const value of values) {
    for (const key in value) {
      target[key] = value[key]
    }
  }
  return target
}


function betweenInclusive(value, start, end) {
  return start <= value && value <= end
}

function betweenExclusive(value, start, end) {
  return start < value && value < end
}

function min(value, other) {
  return value <= other ? value : other
}

function max(value, other) {
  return value >= other ? value : other
}

// LISTS

export function countUntil<T>(list: T[], element: T): number {
  const index = list.indexOf(element)
  return index == -1 ? list.length : index + 1
}

export function takeUntil<T>(list: T[], cond: (e: T) => boolean): T[] {
  const result = []
  for (const element of list) {
    if (cond(element)) {
      return result.concat(element)
    } else {
      result.push(element)
    }
  }
  return result
}

type UtilsBehavior = typeof utils
const utils = { initialize, assign, countUntil, takeUntil, buildIntervalTimestampFor, buildIntervalTimestamp, buildSuccess, betweenInclusive, betweenExclusive, min, max }

export default utils