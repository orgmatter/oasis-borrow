import { Icon } from '@makerdao/dai-ui-icons'
import BigNumber from 'bignumber.js'
import { getToken } from 'blockchain/tokensMetadata'
import { Vault } from 'blockchain/vaults'
import { AppLink } from 'components/Links'
import { Modal, ModalCloseIcon } from 'components/Modal'
import { PriceInfo } from 'features/shared/priceInfo'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { ModalProps, useModal } from 'helpers/modalHook'
import { CommonVaultState, WithChildren } from 'helpers/types'
import { zero } from 'helpers/zero'
import { Trans } from 'next-i18next'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Card, Divider, Flex, Grid, Heading, Text } from 'theme-ui'

type CollRatioColor = 'primary' | 'onError' | 'onWarning' | 'onSuccess'

export type AfterPillProps = {
  showAfterPill?: boolean
  afterPillColors?: { color: string; bg: string }
}

export function getCollRatioColor(
  { inputAmountsEmpty, ilkData }: CommonVaultState,
  collateralizationRatio: BigNumber,
): CollRatioColor {
  const vaultWillBeAtRiskLevelDanger =
    !inputAmountsEmpty &&
    collateralizationRatio.gte(ilkData.liquidationRatio) &&
    collateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

  const vaultWillBeAtRiskLevelWarning =
    !inputAmountsEmpty &&
    collateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
    collateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

  const vaultWillBeUnderCollateralized =
    !inputAmountsEmpty &&
    collateralizationRatio.lt(ilkData.liquidationRatio) &&
    !collateralizationRatio.isZero()

  return collateralizationRatio.isZero()
    ? 'primary'
    : vaultWillBeAtRiskLevelDanger || vaultWillBeUnderCollateralized
    ? 'onError'
    : vaultWillBeAtRiskLevelWarning
    ? 'onWarning'
    : 'onSuccess'
}

export function getPriceChangeColor({
  priceInfo: { collateralPricePercentageChange },
}: CommonVaultState) {
  return collateralPricePercentageChange.isZero()
    ? 'text.muted'
    : collateralPricePercentageChange.gt(zero)
    ? 'onSuccess'
    : 'onError'
}

export function getAfterPillColors(collRatioColor: CollRatioColor) {
  if (collRatioColor === 'primary') {
    return {
      color: 'onSuccess',
      bg: 'success',
    }
  }

  return {
    color: collRatioColor,
    bg: collRatioColor.split('on')[1].toLowerCase(),
  }
}

function VaultDetailsAfterPill({ children, afterPillColors }: WithChildren & AfterPillProps) {
  return (
    <Card
      sx={{
        bg: 'success',
        color: 'onSuccess',
        fontWeight: 'semiBold',
        border: 'none',
        px: 2,
        py: 0,
        mt: 2,
        display: 'inline-block',
        lineHeight: 2,
        fontSize: 1,
        ...afterPillColors,
      }}
    >
      <Box sx={{ px: 1 }}>{children}</Box>
    </Card>
  )
}

export function VaultDetailsCard({
  title,
  value,
  valueBottom,
  valueAfter,
  afterPillColors,
  openModal,
  relevant = true,
}: {
  title: string
  value: ReactNode
  valueBottom?: ReactNode
  valueAfter?: ReactNode
  openModal?: () => void
  relevant?: Boolean
} & AfterPillProps) {
  return (
    <Card
      onClick={openModal}
      sx={{
        border: 'lightMuted',
        overflow: 'hidden',
        minHeight: '194px',
        display: 'flex',
        opacity: relevant ? 1 : 0.5,
        svg: {
          color: 'text.subtitle',
        },
        ...(openModal && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 'vaultDetailsCard',
            svg: {
              color: 'primary',
            },
          },
        }),
      }}
    >
      <Flex
        p={2}
        sx={{
          fontSize: 2,
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box>
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="subheader" sx={{ fontWeight: 'semiBold', fontSize: 'inherit' }}>
              {title}
            </Text>
            {openModal && <Icon name="question_o" size="auto" width="20px" height="20px" />}
          </Flex>
          <Heading variant="header2" sx={{ fontWeight: 'semiBold', mt: openModal ? 0 : 1 }}>
            {value}
          </Heading>
          {valueAfter && (
            <VaultDetailsAfterPill afterPillColors={afterPillColors}>
              {valueAfter} after
            </VaultDetailsAfterPill>
          )}
        </Box>
        <Box sx={{ fontWeight: 'semiBold', minHeight: '1em' }}>{valueBottom}</Box>
      </Flex>
    </Card>
  )
}

export function VaultDetailsCardModal({
  close,
  children,
}: {
  close: () => void
  children: ReactNode
}) {
  return (
    <Modal close={close} sx={{ maxWidth: '530px', margin: '0 auto' }}>
      <ModalCloseIcon {...{ close }} />
      <Grid gap={4} p={4}>
        {children}
      </Grid>
    </Modal>
  )
}

function VaultDetailsCardCurrentPriceModal({
  close,
  currentPrice,
  nextPriceWithChange,
}: ModalProps<{ currentPrice: ReactNode; nextPriceWithChange: ReactNode }>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('manage-multiply-vault.card.current-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.current-price-description')}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">{currentPrice}</Heading>
        </Card>
      </Grid>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('manage-multiply-vault.card.next-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {`${t('manage-multiply-vault.card.next-price-description')}`}
        </Text>
        <Card variant="vaultDetailsCardModal">
          <Heading variant="header3">{nextPriceWithChange}</Heading>
        </Card>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          <Trans
            i18nKey="manage-multiply-vault.card.more-info-oracles"
            components={[
              <AppLink
                href="https://kb.oasis.app/help/the-oracle-security-module"
                withAccountPrefix={false}
                target="_blank"
                sx={{
                  display: 'inline-block',
                  color: 'primary',
                  textDecoration: 'underline',
                }}
              />,
            ]}
          />
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

interface CollaterlizationRatioProps {
  currentCollateralRatio: BigNumber
  collateralRatioOnNextPrice: BigNumber
}

export function VaultDetailsCardCollaterlizationRatioModal({
  currentCollateralRatio,
  collateralRatioOnNextPrice,
  close,
}: ModalProps<CollaterlizationRatioProps>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.collateralization-ratio')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-vault.card.collateralization-ratio-calculated')}
        </Text>
        <Heading variant="header3">
          {t('manage-vault.card.collateralization-ratio-header2')}
        </Heading>
        <Card variant="vaultDetailsCardModal">
          {formatPercent(currentCollateralRatio.times(100).absoluteValue(), {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          })}
        </Card>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-vault.card.collateralization-ratio-description')}
        </Text>
        <Heading variant="header3">
          {t('manage-vault.card.collateralization-ratio-next-price')}
        </Heading>
        <Card variant="vaultDetailsCardModal">
          {formatPercent(collateralRatioOnNextPrice.times(100).absoluteValue(), {
            precision: 2,
            roundMode: BigNumber.ROUND_DOWN,
          })}
        </Card>
      </Grid>
    </VaultDetailsCardModal>
  )
}

interface CollateralLockedProps {
  token: string
  collateralAmountLocked?: BigNumber
  collateralLockedUSD?: BigNumber
}

export function VaultDetailsCardCollateralLockedModal({
  collateralAmountLocked,
  collateralLockedUSD,
  token,
  close,
}: ModalProps<CollateralLockedProps>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.collateral-locked')}`}</Heading>
        <Heading variant="header3">{`${t('manage-vault.card.collateral-locked-amount')}`}</Heading>
        <Card variant="vaultDetailsCardModal">
          {formatAmount(collateralAmountLocked || zero, getToken(token).symbol)}
        </Card>

        <Heading variant="header3">{t('manage-vault.card.collateral-locked-USD')}</Heading>
        <Card variant="vaultDetailsCardModal">
          {collateralLockedUSD && `$${formatAmount(collateralLockedUSD, 'USD')}`}
        </Card>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-vault.card.collateral-locked-oracles')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsBuyingPowerModal({ close }: ModalProps) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.buying-power')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.buying-power-description')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

interface NetValueProps {
  marketPrice?: BigNumber
  netValueUSD: BigNumber
  totalGasSpentUSD: BigNumber
  currentPnL: BigNumber
  vault?: Vault
  priceInfo: PriceInfo
}

export function VaultDetailsNetValueModal({
  marketPrice,
  netValueUSD,
  totalGasSpentUSD,
  vault,
  currentPnL,
  priceInfo,
  close,
}: ModalProps<NetValueProps>) {
  const { t } = useTranslation()
  const collateralTags = vault ? (getToken(vault?.token).tags as String[]) : []
  const isCollateralLpToken = vault ? collateralTags.includes('lp-token') : false
  const renderCollateralValue = !isCollateralLpToken

  const oraclePrice = priceInfo.currentCollateralPrice

  const lockedCollateralUSD = isCollateralLpToken
    ? vault?.lockedCollateralUSD || zero
    : vault && marketPrice
    ? vault.lockedCollateral.times(marketPrice)
    : zero

  const daiDebtUndercollateralizedToken = vault
    ? isCollateralLpToken
      ? vault.debt.dividedBy(oraclePrice)
      : marketPrice
      ? vault.debt.dividedBy(marketPrice)
      : zero
    : zero

  const netValueUndercollateralizedToken = vault
    ? isCollateralLpToken
      ? netValueUSD.dividedBy(oraclePrice)
      : marketPrice
      ? netValueUSD.dividedBy(marketPrice)
      : zero
    : zero

  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{t('manage-multiply-vault.card.net-value')}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2 }}>
          {isCollateralLpToken
            ? t('manage-multiply-vault.card.based-on-price-lp')
            : t('manage-multiply-vault.card.based-on-price')}
        </Text>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2, fontWeight: 'bold' }}>
          ${formatCryptoBalance(marketPrice || oraclePrice)}
        </Text>
      </Grid>
      {/* Grid for just DESKTOP */}
      <Grid
        gap={2}
        columns={[1, 2, 3]}
        variant="subheader"
        sx={{ fontSize: 2, pb: 2, display: ['none', 'none', 'grid'] }}
      >
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>

        <Box>{t('manage-multiply-vault.card.collateral-value-in-vault')}</Box>

        <Box>{`${vault ? formatCryptoBalance(vault.lockedCollateral) : ''} ${
          vault ? vault.token : ''
        }`}</Box>
        <Box>{`$${formatCryptoBalance(lockedCollateralUSD)}`}</Box>
        <Box>{t('manage-multiply-vault.card.dai-debt-in-vault')}</Box>
        {renderCollateralValue ? (
          <Box>
            {vault && `${formatCryptoBalance(daiDebtUndercollateralizedToken)} ${vault.token}`}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{`$${vault ? formatCryptoBalance(vault.debt) : ''}`}</Box>

        <Box>{t('net-value')}</Box>
        {renderCollateralValue ? (
          <Box>
            {vault ? `${formatCryptoBalance(netValueUndercollateralizedToken)} ${vault.token}` : ''}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{`$${formatAmount(netValueUSD, 'USD')}`}</Box>
      </Grid>

      {/* Grid for MOBILE && TABLETs */}
      <Grid
        gap={2}
        columns={[2, 1]}
        variant="subheader"
        sx={{ fontSize: 2, pb: 2, display: ['grid', 'grid', 'none'] }}
      >
        <Box sx={{ fontWeight: 'semiBold' }}>
          {t('manage-multiply-vault.card.collateral-value-in-vault')}
        </Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        <Box>
          {`${vault ? formatCryptoBalance(vault.lockedCollateral) : ''} ${
            vault ? vault.token : ''
          }`}
        </Box>
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{`$${formatCryptoBalance(lockedCollateralUSD)}`}</Box>
        <Box sx={{ fontWeight: 'semiBold' }}>
          {t('manage-multiply-vault.card.dai-debt-in-vault')}
        </Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        {renderCollateralValue ? (
          <Box>
            {vault && `${formatCryptoBalance(daiDebtUndercollateralizedToken)} ${vault.token}`}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{`$${vault ? formatCryptoBalance(vault.debt) : ''}`}</Box>
        <Box sx={{ fontWeight: 'semiBold' }}>{t('net-value')}</Box>
        <Box />
        {renderCollateralValue ? (
          <Box>{t('manage-multiply-vault.card.collateral-value')}</Box>
        ) : (
          <Box />
        )}
        {renderCollateralValue ? (
          <Box>
            {vault && `${formatCryptoBalance(netValueUndercollateralizedToken)} ${vault.token}`}
          </Box>
        ) : (
          <Box />
        )}
        <Box>{t('manage-multiply-vault.card.usd-value')}</Box>
        <Box>{`$${formatAmount(netValueUSD, 'USD')}`}</Box>
      </Grid>

      <Divider variant="styles.hrVaultFormBottom" />
      <Grid gap={2} columns={[1, 2, 3]}>
        <Box>{t('manage-multiply-vault.card.gas-fees')}</Box>
        <Box></Box>
        <Box>{`$${formatAmount(totalGasSpentUSD, 'USD')}`}</Box>
      </Grid>
      <Card
        variant="vaultDetailsCardModal"
        sx={{ fontWeight: 'semiBold', alignItems: 'center', textAlign: 'center' }}
      >
        <Text variant="paragraph2" sx={{ fontSize: 1, pb: 2 }}>
          {t('manage-multiply-vault.card.unrealised-pnl')}
        </Text>
        <Text>{formatPercent(currentPnL.times(100), { precision: 2 })}</Text>
      </Card>
      <Grid>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.formula')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

interface LiquidationProps {
  liquidationPrice: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
}

export function VaultDetailsLiquidationModal({
  liquidationPrice,
  liquidationPriceCurrentPriceDifference,
  close,
}: ModalProps<LiquidationProps>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">{`${t('system.liquidation-price')}`}</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-multiply-vault.card.liquidation-price-description')}
        </Text>
        <Heading variant="header3">
          {t('manage-multiply-vault.card.liquidation-price-current')}
        </Heading>
        <Card variant="vaultDetailsCardModal">{`$${formatAmount(liquidationPrice, 'USD')}`}</Card>
        {liquidationPriceCurrentPriceDifference && (
          <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
            {t(
              'manage-multiply-vault.card.liquidation-percentage-below',
              formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
                precision: 2,
                roundMode: BigNumber.ROUND_DOWN,
              }),
            )}
          </Text>
        )}
      </Grid>
    </VaultDetailsCardModal>
  )
}

export function VaultDetailsCardLiquidationPrice({
  liquidationPrice,
  liquidationPriceCurrentPriceDifference,
  afterLiquidationPrice,
  afterPillColors,
  showAfterPill,
  relevant = true,
}: {
  liquidationPrice: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  afterLiquidationPrice?: BigNumber
  relevant?: Boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={t('system.liquidation-price')}
      value={`$${formatAmount(liquidationPrice, 'USD')}`}
      valueAfter={showAfterPill && `$${formatAmount(afterLiquidationPrice || zero, 'USD')}`}
      valueBottom={
        liquidationPriceCurrentPriceDifference && (
          <>
            {formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              {` ${
                liquidationPriceCurrentPriceDifference.lt(zero) ? 'above' : 'below'
              } current price`}
            </Text>
          </>
        )
      }
      openModal={() =>
        openModal(VaultDetailsLiquidationModal, {
          liquidationPrice: liquidationPrice,
          liquidationPriceCurrentPriceDifference: liquidationPriceCurrentPriceDifference,
        })
      }
      relevant={relevant}
      afterPillColors={afterPillColors}
    />
  )
}

export function VaultDetailsCardCurrentPrice(props: CommonVaultState) {
  const {
    priceInfo: {
      currentCollateralPrice,
      nextCollateralPrice,
      isStaticCollateralPrice,
      collateralPricePercentageChange,
    },
  } = props
  const openModal = useModal()
  const priceChangeColor = getPriceChangeColor(props)

  const currentPrice = `$${formatAmount(currentCollateralPrice, 'USD')}`
  const nextPriceWithChange = (
    <>
      <Text>${formatAmount(nextCollateralPrice, 'USD')}</Text>
      <Text sx={{ ml: 2, fontSize: 1 }}>
        {formatPercent(collateralPricePercentageChange.times(100), { precision: 2 })}
      </Text>
    </>
  )

  return (
    <VaultDetailsCard
      title={`Current Price`}
      value={currentPrice}
      valueBottom={
        isStaticCollateralPrice ? null : (
          <Flex sx={{ whiteSpace: 'pre-wrap' }}>
            <Text sx={{ color: 'text.subtitle' }}>Next </Text>
            <Flex
              variant="paragraph2"
              sx={{ fontWeight: 'semiBold', alignItems: 'center', color: priceChangeColor }}
            >
              {nextPriceWithChange}
            </Flex>
          </Flex>
        )
      }
      openModal={() =>
        openModal(VaultDetailsCardCurrentPriceModal, {
          currentPrice,
          nextPriceWithChange: (
            <Flex sx={{ alignItems: 'center', color: priceChangeColor }}>
              {nextPriceWithChange}
            </Flex>
          ),
        })
      }
    />
  )
}

export function VaultDetailsCardCollateralLocked({
  depositAmountUSD,
  depositAmount,
  afterDepositAmountUSD,
  token,
  afterPillColors,
  showAfterPill,
  relevant = true,
}: {
  depositAmountUSD?: BigNumber
  depositAmount?: BigNumber
  afterDepositAmountUSD?: BigNumber
  token: string
  relevant?: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={`${t('system.collateral-locked')}`}
      value={`$${formatAmount(depositAmountUSD || zero, 'USD')}`}
      valueAfter={showAfterPill && `$${formatAmount(afterDepositAmountUSD || zero, 'USD')}`}
      valueBottom={
        <>
          {formatAmount(depositAmount || zero, getToken(token).symbol)}
          <Text as="span" sx={{ color: 'text.subtitle' }}>
            {` ${getToken(token).symbol}`}
          </Text>
        </>
      }
      openModal={() =>
        openModal(VaultDetailsCardCollateralLockedModal, {
          token: token,
          collateralAmountLocked: depositAmount,
          collateralLockedUSD: afterDepositAmountUSD,
        })
      }
      afterPillColors={afterPillColors}
      relevant={relevant}
    />
  )
}

export function VaultDetailsCardNetValue({
  netValueUSD,
  afterNetValueUSD,
  afterPillColors,
  showAfterPill,
  currentPnL,
  marketPrice,
  totalGasSpentUSD,
  vault,
  priceInfo,
  relevant = true,
}: {
  netValueUSD: BigNumber
  afterNetValueUSD: BigNumber
  currentPnL: BigNumber
  marketPrice?: BigNumber
  totalGasSpentUSD: BigNumber
  vault: Vault | undefined
  priceInfo: PriceInfo
  relevant?: boolean
} & AfterPillProps) {
  const openModal = useModal()
  const { t } = useTranslation()

  return (
    <VaultDetailsCard
      title={t('manage-multiply-vault.card.net-value')}
      value={`$${formatAmount(netValueUSD, 'USD')}`}
      valueBottom={`${t('manage-multiply-vault.card.unrealised-pnl')} ${formatPercent(
        currentPnL.times(100),
        {
          precision: 2,
          roundMode: BigNumber.ROUND_DOWN,
        },
      )}`}
      valueAfter={showAfterPill && `$${formatAmount(afterNetValueUSD, 'USD')}`}
      openModal={() =>
        openModal(VaultDetailsNetValueModal, {
          marketPrice,
          netValueUSD,
          totalGasSpentUSD,
          currentPnL,
          vault,
          priceInfo,
        })
      }
      afterPillColors={afterPillColors}
      relevant={relevant}
    />
  )
}

export function VaultDetailsSummaryContainer({
  children,
  relevant = true,
}: WithChildren & { relevant?: boolean }) {
  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted', opacity: relevant ? 1 : 0.5 }}>
      <Grid
        columns={[1, null, null, 3]}
        sx={{ py: 3, px: 2, alignItems: 'flex-start' }}
        gap={[4, null, null, 3]}
      >
        {children}
      </Grid>
    </Card>
  )
}

export function VaultDetailsSummaryItem({
  label,
  value,
  valueAfter,
  afterPillColors,
}: { label: ReactNode; value: ReactNode; valueAfter?: ReactNode } & AfterPillProps) {
  return (
    <Grid gap={1}>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', fontWeight: 'semiBold' }}>
        {label}
      </Text>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {value}
      </Text>
      {valueAfter && (
        <Box>
          <VaultDetailsAfterPill afterPillColors={afterPillColors}>
            {valueAfter} after
          </VaultDetailsAfterPill>
        </Box>
      )}
    </Grid>
  )
}
