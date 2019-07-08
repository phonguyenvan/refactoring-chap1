import { IPlays, IInvoice, EPlayType } from './metadata'

export const samplePlays: IPlays = {
  hamlet: { name: 'Hamlet', type: EPlayType.TRADGEDY },
  'as-like': { name: 'As You Like It', type: EPlayType.COMEDY },
  othello: { name: 'Othello', type: EPlayType.TRADGEDY },
}

export const sampleInvoice: IInvoice = {
  customer: 'BigCo',
  performances: [
    { playId: 'hamlet', audience: 55 },
    { playId: 'as-like', audience: 35 },
    { playId: 'othello', audience: 40 },
  ]
}
