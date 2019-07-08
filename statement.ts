import { IInvoice, IPlays, EPlayType, IPerformance, IPlay } from './metadata'

export function statement (invoice: IInvoice, plays: IPlays) {
  let totalAmount = 0
  let volumeCredits = 0

  let result = `Statement for ${invoice.customer}\n`
  const { format } = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

  for (let perf of invoice.performances) {
    const play = plays[perf.playId]
    const thisAmount = amountFor(perf, play)
    volumeCredits += Math.max(perf.audience - 30, 0)
    if (play.type == EPlayType.COMEDY) volumeCredits += Math.floor(perf.audience / 5)

    result += `  ${play.name}: ${format(thisAmount / 100)} (${perf.audience} seats)\n`
    totalAmount += thisAmount
  }
  result += `Amount owed is ${format(totalAmount / 100)} \n`
  result += `You earned ${volumeCredits} credits\n`
  return result

  function amountFor(perf: IPerformance, play: IPlay) {
    let result = 0

    switch (play.type) {
      case EPlayType.TRADGEDY:
        result = 40000
        if (perf.audience > 30) {
          result += 1000 * (perf.audience - 30)
        }
        break
      case EPlayType.COMEDY:
        result = 30000
        if (perf.audience > 20) {
          result += 10000 + 500 * (perf.audience - 20)
        }
        result += 300 * perf.audience
        break
      default:
        throw new Error(`unknown type: ${play.type}`)
    }

    return result
  }
}
