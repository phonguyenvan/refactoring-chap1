import { IPerformance, IPlay, EPlayType } from './metadata'

class PerformanceCalculator {
  constructor(public perf: IPerformance, public play: IPlay) { }

  getAmount() {
    throw new Error('subclass responsibility')
  }

  getVolumeCredits() {
    let result = 0
    result += Math.max(this.perf.audience - 30, 0)
    return result
  }
}

export class ComedyCalculator extends PerformanceCalculator {
  getAmount() {
    let result = 30000
    if (this.perf.audience > 20) {
      result += 10000 + 500 * (this.perf.audience - 20)
    }
    result += 300 * this.perf.audience
    return result
  }

  getVolumeCredits() {
    return super.getVolumeCredits() + Math.floor(this.perf.audience / 5)
  }
}

export class TradgedyCalculator extends PerformanceCalculator {
  getAmount() {
    let result = 0
    result = 40000
    if (this.perf.audience > 30) {
      result += 1000 * (this.perf.audience - 30)
    }
    return result
  }
}

export function createPerformanceCalculator(perf: IPerformance, play: IPlay) {
  if (play.type === EPlayType.TRADGEDY) return new TradgedyCalculator(perf, play)
  if (play.type === EPlayType.COMEDY) return new ComedyCalculator(perf, play)
  throw new Error(`unknown type: ${play.type}`)
}
