/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerTestBed, TestBed, TestBedConfig } from '../../../../../../test_utils';
import { BASE_PATH } from '../../../common/constants';
import { TemplateCreate } from '../../../public/sections/template_create';
import { Template } from '../../../common/types';

const testBedConfig: TestBedConfig = {
  memoryRouter: {
    initialEntries: [`${BASE_PATH}create_template`],
    componentRoutePath: `${BASE_PATH}create_template`,
  },
  doMountAsync: true,
};

const initTestBed = registerTestBed(TemplateCreate, testBedConfig);

export interface TemplateCreateTestBed extends TestBed<TemplateCreateTestSubjects> {
  actions: {
    clickNextButton: () => void;
    clickBackButton: () => void;
    clickSubmitButton: () => void;
    completeStepOne: ({ name, indexPatterns, order, version }: Partial<Template>) => void;
    completeStepTwo: ({ settings }: Partial<Template>) => void;
    completeStepThree: ({ mappings }: Partial<Template>) => void;
    completeStepFour: ({ aliases }: Partial<Template>) => void;
    selectSummaryTab: (tab: 'summary' | 'request') => void;
  };
}

export const setup = async (): Promise<TemplateCreateTestBed> => {
  const testBed = await initTestBed();

  // User actions
  const clickNextButton = () => {
    testBed.find('nextButton').simulate('click');
  };

  const clickBackButton = () => {
    testBed.find('backButton').simulate('click');
  };

  const clickSubmitButton = () => {
    testBed.find('submitButton').simulate('click');
  };

  const completeStepOne = ({ name, indexPatterns, order, version }: Partial<Template>) => {
    const { form, find } = testBed;

    if (name) {
      form.setInputValue('nameInput', name);
    }

    if (indexPatterns) {
      const indexPatternsFormatted = indexPatterns.map((pattern: string) => ({
        label: pattern,
        value: pattern,
      }));

      find('mockComboBox').simulate('change', indexPatternsFormatted); // Using mocked EuiComboBox
    }

    if (order) {
      form.setInputValue('orderInput', JSON.stringify(order));
    }

    if (version) {
      form.setInputValue('versionInput', JSON.stringify(version));
    }

    clickNextButton();
  };

  const completeStepTwo = ({ settings }: Partial<Template>) => {
    const { find, exists } = testBed;

    expect(exists('stepSettings')).toBe(true);
    expect(find('stepTitle').text()).toEqual('Index settings (optional)');

    if (settings) {
      find('mockCodeEditor').simulate('change', {
        jsonString: settings,
      }); // Using mocked EuiCodeEditor
    }

    clickNextButton();
  };

  const completeStepThree = ({ mappings }: Partial<Template>) => {
    const { find, exists } = testBed;

    expect(exists('stepMappings')).toBe(true);
    expect(find('stepTitle').text()).toEqual('Mappings (optional)');

    if (mappings) {
      find('mockCodeEditor').simulate('change', {
        jsonString: mappings,
      }); // Using mocked EuiCodeEditor
    }

    clickNextButton();
  };

  const completeStepFour = ({ aliases }: Partial<Template>) => {
    const { find, exists } = testBed;

    expect(exists('stepAliases')).toBe(true);
    expect(find('stepTitle').text()).toEqual('Aliases (optional)');

    if (aliases) {
      find('mockCodeEditor').simulate('change', {
        jsonString: aliases,
      }); // Using mocked EuiCodeEditor
    }

    clickNextButton();
  };

  const selectSummaryTab = (tab: 'summary' | 'request') => {
    const tabs = ['summary', 'request'];

    testBed
      .find('summaryTabContent')
      .find('.euiTab')
      .at(tabs.indexOf(tab))
      .simulate('click');
  };

  return {
    ...testBed,
    actions: {
      clickNextButton,
      clickBackButton,
      clickSubmitButton,
      completeStepOne,
      completeStepTwo,
      completeStepThree,
      completeStepFour,
      selectSummaryTab,
    },
  };
};

export type TemplateCreateTestSubjects = TestSubjects;

type TestSubjects =
  | 'backButton'
  | 'codeEditorContainer'
  | 'indexPatternsComboBox'
  | 'indexPatternsWarning'
  | 'indexPatternsWarningDescription'
  | 'mockCodeEditor'
  | 'mockComboBox'
  | 'nameInput'
  | 'nextButton'
  | 'orderInput'
  | 'pageTitle'
  | 'requestTab'
  | 'saveTemplateError'
  | 'settingsEditor'
  | 'stepAliases'
  | 'stepMappings'
  | 'stepSettings'
  | 'stepSummary'
  | 'stepTitle'
  | 'submitButton'
  | 'summaryTab'
  | 'summaryTabContent'
  | 'testingEditor'
  | 'versionInput';
