import { trackingEvents } from 'analytics/analytics'
import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { VaultAllowance, VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultFormVaultTypeSwitch, WithVaultFormStepIndicator } from 'components/vault/VaultForm'
import { VaultFormContainer } from 'components/vault/VaultFormContainer'
import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Container, Grid, Text } from 'theme-ui'

import { VaultErrors } from '../../../components/vault/VaultErrors'
import { VaultWarnings } from '../../../components/vault/VaultWarnings'
import { OpenVaultState } from '../openVault'
import { createOpenVaultAnalytics$ } from '../openVaultAnalytics'
import { OpenVaultButton } from './OpenVaultButton'
import { OpenVaultConfirmation, OpenVaultStatus } from './OpenVaultConfirmation'
import { OpenVaultDetails } from './OpenVaultDetails'
import { OpenVaultEditing } from './OpenVaultEditing'

function OpenVaultTitle({
  isEditingStage,
  isProxyStage,
  isAllowanceStage,
  token,
  stage,
  totalSteps,
  currentStep,
}: OpenVaultState) {
  const { t } = useTranslation()
  return (
    <Box>
      <WithVaultFormStepIndicator {...{ totalSteps, currentStep }}>
        <Text variant="paragraph2" sx={{ fontWeight: 'semiBold', mb: 1 }}>
          {isEditingStage
            ? t('vault-form.header.edit')
            : isProxyStage
            ? t('vault-form.header.proxy')
            : isAllowanceStage
            ? t('vault-form.header.allowance', { token: token.toUpperCase() })
            : stage === 'txInProgress'
            ? t('vault-form.header.confirm-in-progress')
            : t('vault-form.header.confirm')}
        </Text>
      </WithVaultFormStepIndicator>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle', lineHeight: '22px' }}>
        {isEditingStage
          ? t('vault-form.subtext.edit')
          : isProxyStage
          ? t('vault-form.subtext.proxy')
          : isAllowanceStage
          ? t('vault-form.subtext.allowance')
          : stage === 'txInProgress'
          ? t('vault-form.subtext.confirm-in-progress')
          : t('vault-form.subtext.review-manage')}
      </Text>
    </Box>
  )
}

function OpenVaultForm(props: OpenVaultState) {
  const { isEditingStage, isProxyStage, isAllowanceStage, isOpenStage, ilk, stage } = props

  return (
    <VaultFormContainer toggleTitle="Open Vault">
      <OpenVaultTitle {...props} />
      {isEditingStage && <OpenVaultEditing {...props} />}
      {isAllowanceStage && <VaultAllowance {...props} />}
      {isOpenStage && <OpenVaultConfirmation {...props} />}
      <VaultErrors {...props} />
      <VaultWarnings {...props} />
      {stage === 'txSuccess' && <VaultChangesWithADelayCard />}
      <OpenVaultButton {...props} />
      {isProxyStage && <VaultProxyStatusCard {...props} />}
      {isAllowanceStage && <VaultAllowanceStatus {...props} />}
      {isOpenStage && <OpenVaultStatus {...props} />}
      {isEditingStage ? (
        <VaultFormVaultTypeSwitch
          href={`/vaults/open-multiply/${ilk}`}
          title="Switch to Multiply"
          visible={ALLOWED_MULTIPLY_TOKENS.includes(props.token)}
        />
      ) : null}
    </VaultFormContainer>
  )
}

export function OpenVaultContainer(props: OpenVaultState) {
  const { ilk, clear } = props
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <DefaultVaultHeader {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box>
          <OpenVaultDetails {...props} />
        </Box>
        <Box>
          <OpenVaultForm {...props} />
        </Box>
      </Grid>
    </>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { openVault$, accountData$, context$ } = useAppContext()
  const openVaultWithIlk$ = openVault$(ilk)
  const openVaultWithError = useObservableWithError(openVaultWithIlk$)

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      accountData$,
      openVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler error={openVaultWithError.error}>
      <WithLoadingIndicator value={openVaultWithError.value}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenVaultContainer {...openVault} />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
