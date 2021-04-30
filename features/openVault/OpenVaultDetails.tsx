import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import moment from 'moment'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import { OpenVaultState } from './openVault'
import { OpenVaultHeading } from './OpenVaultView'

function VaultDetailsTableItem({
  label,
  value,
}: {
  label: string | JSX.Element
  value: string | JSX.Element
}) {
  return (
    <Grid sx={{ gridTemplateRows: '1fr 1fr' }} gap={0}>
      <Box variant="text.paragraph3" sx={{ color: 'text.off', mb: 2 }}>
        {label}
      </Box>
      <Box variant="text.header3">
        <Text sx={{ display: 'inline' }} variant="header3">
          {value}
        </Text>
      </Box>
    </Grid>
  )
}

export function VaultDetailsTable({
  generateAmount,
  afterFreeCollateral,
  token,
  maxGenerateAmountCurrentPrice,
  ilkData,
}: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <Box sx={{ gridColumn: ['1', '1/3'], mt: [4, 6] }}>
      <Heading variant="header3" mb="4">
        {t('vault.vault-details')}
      </Heading>
      <Grid
        columns={['1fr 1fr', '1fr 1fr 1fr']}
        sx={{ border: 'light', borderRadius: 'medium', p: [3, 4] }}
      >
        <VaultDetailsTableItem
          label={t('system.vault-dai-debt')}
          value={
            <>
              {formatAmount(generateAmount || zero, 'DAI')}
              <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
                DAI
              </Text>
            </>
          }
        />
        <VaultDetailsTableItem
          label={t('system.available-to-withdraw')}
          value={
            <>
              {formatAmount(
                afterFreeCollateral.isNegative() ? zero : afterFreeCollateral,
                getToken(token).symbol,
              )}
              <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
                {getToken(token).symbol}
              </Text>
            </>
          }
        />
        <VaultDetailsTableItem
          label={t('system.available-to-generate')}
          value={
            <>
              {formatAmount(maxGenerateAmountCurrentPrice, 'DAI')}
              <Text sx={{ display: 'inline', ml: 2, fontWeight: 'semiBold' }} variant="paragraph3">
                USD
              </Text>
            </>
          }
        />
        <Box
          sx={{
            display: ['none', 'block'],
            gridColumn: '1/4',
            borderBottom: 'light',
            height: '1px',
            my: 3,
          }}
        />
        <VaultDetailsTableItem
          label={t('system.liquidation-ratio')}
          value={formatPercent(ilkData.liquidationRatio.times(100), { precision: 2 })}
        />
        <VaultDetailsTableItem
          label={t('system.stability-fee')}
          value={formatPercent(ilkData.stabilityFee.times(100), { precision: 2 })}
        />
        <VaultDetailsTableItem
          label={t('system.liquidation-penalty')}
          value={formatPercent(ilkData.liquidationPenalty.times(100), { precision: 2 })}
        />
      </Grid>
    </Box>
  )
}

export function OpenVaultDetails(props: OpenVaultState) {
  const {
    afterCollateralizationRatio,
    afterLiquidationPrice,
    token,
    depositAmount,
    depositAmountUSD,
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      dateNextCollateralPrice,
    },
  } = props

  const { t } = useTranslation()

  const afterCollRatio = afterCollateralizationRatio.eq(zero)
    ? '--'
    : formatPercent(afterCollateralizationRatio.times(100), { precision: 2 })

  const newPriceIn = moment(dateNextCollateralPrice).diff(Date.now(), 'minutes')

  const nextPriceDiff = nextCollateralPrice
    .minus(currentCollateralPrice)
    .div(currentCollateralPrice)
    .times(100)

  const priceChangeColor = nextPriceDiff.isZero()
    ? 'text.muted'
    : nextPriceDiff.gt(zero)
    ? 'onSuccess'
    : 'onError'

  return (
    <Grid sx={{ alignSelf: 'flex-start' }} columns={[1, '1fr 1fr']}>
      <OpenVaultHeading {...props} sx={{ display: ['none', 'block'] }} />

      {/* Liquidation Price */}
      <Box sx={{ mt: [3, 5], textAlign: ['center', 'left'] }}>
        <Heading variant="subheader" as="h2">
          {t('system.liquidation-price')}
        </Heading>
        <Text variant="display">${formatAmount(afterLiquidationPrice, 'USD')}</Text>
      </Box>

      {/* Collaterization Ratio */}
      <Box sx={{ textAlign: ['center', 'right'], mt: [3, 5] }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateralization-ratio')}
        </Heading>
        <Text variant="display">{afterCollRatio}</Text>
      </Box>

      {/* Current Price */}
      {isStaticCollateralPrice ? (
        <Box sx={{ mt: [3, 6], textAlign: ['center', 'left'] }}>
          <Heading variant="subheader" as="h2">
            {t('vaults.current-price', { token })}
          </Heading>
          <Text variant="header2">${formatAmount(currentCollateralPrice, 'USD')}</Text>
        </Box>
      ) : (
        <Box sx={{ mt: [3, 6], textAlign: ['center', 'left'] }}>
          <Box>
            <Heading variant="subheader" as="h2">{`Current ${token}/USD price`}</Heading>
            <Text variant="header2" sx={{ py: 3 }}>
              $ {formatAmount(currentCollateralPrice, 'USD')}
            </Text>
          </Box>

          <Flex sx={{ alignItems: ['center', 'flex-start'], flexDirection: 'column' }}>
            <Heading variant="subheader" as="h3">
              <Box sx={{ mr: 2 }}>
                {newPriceIn < 2
                  ? t('vault.next-price-any-time', { count: newPriceIn })
                  : t('vault.next-price', { count: newPriceIn })}
              </Box>
            </Heading>
            <Flex
              variant="paragraph2"
              sx={{ fontWeight: 'semiBold', alignItems: 'center', color: priceChangeColor }}
            >
              <Text>${formatAmount(nextCollateralPrice, 'USD')}</Text>
              <Text sx={{ ml: 2 }}>({formatPercent(nextPriceDiff, { precision: 2 })})</Text>
              {nextPriceDiff.isZero() ? null : (
                <Icon sx={{ ml: 2 }} name={nextPriceDiff.gt(zero) ? 'increase' : 'decrease'} />
              )}
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Collateral Locked */}
      <Box sx={{ textAlign: ['center', 'right'], mt: [3, 6] }}>
        <Heading variant="subheader" as="h2">
          {t('system.collateral-locked')}
        </Heading>
        <Text variant="header2" sx={{ py: 3 }}>
          {depositAmount ? formatAmount(depositAmount, getToken(token).symbol) : '--'}
        </Text>
        <Text>${depositAmountUSD ? formatAmount(depositAmountUSD, 'USD') : '--'}</Text>
      </Box>
      <VaultDetailsTable {...props} />
    </Grid>
  )
}