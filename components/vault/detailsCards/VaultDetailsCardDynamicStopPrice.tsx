import BigNumber from 'bignumber.js'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Heading, Text } from 'theme-ui'

import { formatAmount } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { zero } from '../../../helpers/zero'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function VaultDetailsDynamicStopPriceModal({ close }: ModalProps) {
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">Dynamic Stop Price Modal</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          VaultDetailsDynamicStopPriceModal dummy modal
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardDynamicStopPrice({
  slRatio,
  afterSlRatio,
  liquidationPrice,
  afterLiquidationPrice,
  liquidationRatio,
  afterPillColors,
  showAfterPill,
  isProtected,
}: {
  slRatio: BigNumber
  afterSlRatio?: BigNumber
  liquidationPrice: BigNumber
  afterLiquidationPrice?: BigNumber
  liquidationRatio: BigNumber
  isProtected: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)
  const afterDynamicStopPrice =
    afterLiquidationPrice && afterSlRatio
      ? afterLiquidationPrice.div(liquidationRatio).times(afterSlRatio)
      : zero

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.dynamic-stop-price')}
      value={isProtected ? `$${formatAmount(dynamicStopPrice, 'USD')}` : '-'}
      valueBottom={
        isProtected ? (
          <>
            ${formatAmount(dynamicStopPrice.minus(liquidationPrice), 'USD')}{' '}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {t('manage-multiply-vault.card.above-liquidation-price')}
            </Text>
          </>
        ) : (
          '-'
        )
      }
      valueAfter={showAfterPill && `$${formatAmount(afterDynamicStopPrice, 'USD')}`}
      openModal={() => openModal(VaultDetailsDynamicStopPriceModal)}
      afterPillColors={afterPillColors}
    />
  )
}
