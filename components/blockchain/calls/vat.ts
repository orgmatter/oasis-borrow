import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { Vat } from 'types/web3-v1-contracts/vat'
import Web3 from 'web3'
import { Integer, wrap as wrapℤ, unwrap as unwrapℤ, zero } from 'money-ts/lib/Integer'
import bigInt from 'big-integer'

import { amountFromRad, amountFromRay } from '../utils'
import { CallDef } from './callsHelpers'

interface VatUrnsArgs {
  ilk: string
  urnAddress: string
}

export interface Urn<Ilk> {
  collateral: BigNumber
  normalizedDebt: Integer
}

export const vatUrns: CallDef<VatUrnsArgs, Urn<Ilk> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.urns
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: ({ ink, art }: any) => {
    return {
      collateral: amountFromWei(new BigNumber(ink)),
      normalizedDebt: wrapℤ(bigInt(art)),
    }
  },
}

export interface VatIlk {
  normalizedIlkDebt: BigNumber // Art [wad]
  debtScalingFactor: BigNumber // rate [ray]
  maxDebtPerUnitCollateral: BigNumber // spot [ray]
  debtCeiling: BigNumber // line [rad]
  debtFloor: BigNumber // debtFloor [rad]
}

export const vatIlks: CallDef<string, VatIlk> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.ilks
  },
  prepareArgs: (ilk) => [Web3.utils.utf8ToHex(ilk)],
  postprocess: (ilk: any) => ({
    normalizedIlkDebt: amountFromWei(new BigNumber(ilk.Art)),
    debtScalingFactor: amountFromRay(new BigNumber(ilk.rate)),
    maxDebtPerUnitCollateral: amountFromRay(new BigNumber(ilk.spot)),
    debtCeiling: amountFromRad(new BigNumber(ilk.line)),
    debtFloor: amountFromRad(new BigNumber(ilk.dust)),
  }),
}

interface VatGemArgs {
  ilk: string
  urnAddress: string
}

export const vatGem: CallDef<VatGemArgs, BigNumber> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.gem
  },
  prepareArgs: ({ ilk, urnAddress }) => [Web3.utils.utf8ToHex(ilk), urnAddress],
  postprocess: (gem) => new BigNumber(gem),
}

export const vatLine: CallDef<{}, BigNumber> = {
  call: (_, { contract, vat }) => {
    return contract<Vat>(vat).methods.Line
  },
  prepareArgs: () => [],
}