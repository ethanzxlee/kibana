/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment, useState, useRef } from 'react';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiSpacer,
} from '@elastic/eui';
import { MappingsEditor, Mappings } from '../../../../static/ui';
import { Template } from '../../../../common/types';
import { TemplateSteps } from './template_steps';
import { TemplateValidation, validateTemplate } from '../../../services/validation';
import { StepAliases, StepLogistics, StepMappings, StepSettings, StepReview } from './steps';
import { StepProps } from './types';
import { SectionError } from '../../../components';

interface Props {
  onSave: (template: Template) => void;
  clearSaveError: () => void;
  isSaving: boolean;
  saveError: any;
}

type GetMappingsEditorDataHandler = () => { isValid: boolean; data: Mappings };

const defaultTemplate: Template = {
  name: '',
  indexPatterns: [],
  version: '',
  order: '',
  settings: undefined,
  mappings: {},
  aliases: undefined,
};

export const TemplatesForm: React.FunctionComponent<Props> = ({
  onSave,
  isSaving,
  saveError,
  clearSaveError,
}) => {
  // hooks
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(0);
  const [template, setTemplate] = useState<Template>(defaultTemplate);
  const [validation, setValidation] = useState<TemplateValidation>({
    isValid: true,
    errors: {},
  });

  const getMappingsEditorData = useRef<GetMappingsEditorDataHandler>(() => ({
    isValid: true,
    data: {},
  }));

  const setGetMappingsEditorDataHandler = (handler: GetMappingsEditorDataHandler) =>
    (getMappingsEditorData.current = handler);

  const StepMappingsWithEditor = () => (
    <StepMappings
      template={template}
      updateTemplate={updateTemplate}
      errors={errors}
      updateCurrentStep={updateCurrentStep}
    >
      <MappingsEditor
        setGetDataHandler={setGetMappingsEditorDataHandler}
        FormattedMessage={FormattedMessage}
      />
    </StepMappings>
  );

  const stepComponentMap: { [key: number]: React.FunctionComponent<StepProps> } = {
    1: StepLogistics,
    2: StepSettings,
    3: StepMappingsWithEditor,
    4: StepAliases,
    5: StepReview,
  };

  const lastStep = Object.keys(stepComponentMap).length;

  const CurrentStepComponent = stepComponentMap[currentStep];

  const { errors, isValid } = validation;

  const validationErrors = Object.keys(errors).reduce((acc: any, key: string) => {
    return [...acc, ...errors[key]];
  }, []);

  const updateTemplate = (updatedTemplate: Partial<Template>): void => {
    const newTemplate = { ...template, ...updatedTemplate };

    setTemplate(newTemplate);
  };

  const updateCurrentStep = (step: number) => {
    const prevStep = step - 1;

    if (maxCompletedStep < prevStep) {
      return;
    }
    setCurrentStep(step);
    setMaxCompletedStep(prevStep);
    clearSaveError();
  };

  const onBack = () => {
    const prevStep = currentStep - 1;

    setCurrentStep(prevStep);
    setMaxCompletedStep(prevStep - 1);
    clearSaveError();
  };

  const onNext = () => {
    const nextStep = currentStep + 1;
    let newValidation = validateTemplate(template);

    // step 3 (mappings) utilizes the mappings plugin and requires different logic to validate and set value
    if (currentStep === 3) {
      const { isValid: isMappingValid, data } = getMappingsEditorData.current();

      setTemplate({ ...template, mappings: data });

      if (!isMappingValid) {
        newValidation = {
          isValid: false,
          errors: {
            mappings: [
              i18n.translate('xpack.idxMgmt.templateValidation.mappingsInvalidError', {
                defaultMessage: 'Mappings data is invalid.',
              }),
            ],
          },
        };
      }
    }

    setValidation(newValidation);

    if (newValidation.isValid) {
      setMaxCompletedStep(Math.max(currentStep, maxCompletedStep));
      setCurrentStep(nextStep);
    }
  };

  return (
    <Fragment>
      <TemplateSteps
        currentStep={currentStep}
        maxCompletedStep={maxCompletedStep}
        updateCurrentStep={updateCurrentStep}
      />

      <EuiSpacer size="l" />

      {saveError ? (
        <Fragment>
          <SectionError
            title={
              <FormattedMessage
                id="xpack.idxMgmt.templatesForm.saveTemplateError"
                defaultMessage="Unable to create template"
              />
            }
            error={saveError}
          />
          <EuiSpacer size="m" />
        </Fragment>
      ) : null}

      <EuiForm isInvalid={!isValid} error={validationErrors} data-test-subj="templatesForm">
        <CurrentStepComponent
          template={template}
          updateTemplate={updateTemplate}
          errors={errors}
          updateCurrentStep={updateCurrentStep}
        />
        <EuiSpacer size="l" />

        <EuiFlexGroup>
          {currentStep > 1 ? (
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty iconType="arrowLeft" onClick={onBack}>
                <FormattedMessage
                  id="xpack.idxMgmt.templatesForm.backButtonLabel"
                  defaultMessage="Back"
                />
              </EuiButtonEmpty>
            </EuiFlexItem>
          ) : null}

          {currentStep < lastStep ? (
            <EuiFlexItem grow={false}>
              <EuiButton fill iconType="arrowRight" onClick={onNext}>
                <FormattedMessage
                  id="xpack.idxMgmt.templatesForm.nextButtonLabel"
                  defaultMessage="Next"
                />
              </EuiButton>
            </EuiFlexItem>
          ) : null}

          {currentStep === lastStep ? (
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                color="secondary"
                iconType="check"
                onClick={onSave.bind(null, template)}
                isLoading={isSaving}
              >
                {isSaving ? (
                  <FormattedMessage
                    id="xpack.idxMgmt.templatesForm.savingButtonLabel"
                    defaultMessage="Creating..."
                  />
                ) : (
                  <FormattedMessage
                    id="xpack.idxMgmt.templatesForm.submitButtonLabel"
                    defaultMessage="Create template"
                  />
                )}
              </EuiButton>
            </EuiFlexItem>
          ) : null}
        </EuiFlexGroup>
      </EuiForm>

      <EuiSpacer size="m" />
    </Fragment>
  );
};
