export default {
    editor: {
        label: {
            en: 'Quote Acceptance'
        },
        icon: 'check-circle',
        bubble: {
            icon: 'check-circle'
        }
    },
    triggerEvents: [
        {
            name: 'quote:validate',
            label: { en: 'On quote validate' },
            event: {
                token: '',
                timestamp: ''
            }
        },
        {
            name: 'quote:accept',
            label: { en: 'On quote accept' },
            event: {
                token: '',
                quoteData: {},
                timestamp: ''
            }
        },
        {
            name: 'quote:accepted',
            label: { en: 'Quote accepted successfully' },
            event: {
                token: '',
                quoteId: '',
                timestamp: ''
            }
        }
    ],
    properties: {
        validateTokenUrl: {
            label: {
                en: 'Validate Token URL'
            },
            type: 'Text',
            defaultValue: 'https://api.retool.com/v1/workflows/7ecf25b7-d8ff-4c0f-b879-1d2f60d255a2/startTrigger',
            bindable: true,
            section: 'settings',
            options: {
                placeholder: 'https://api.retool.com/v1/workflows/YOUR-WORKFLOW-ID/startTrigger'
            }
        },
        validateApiKey: {
            label: {
                en: 'Validate API Key'
            },
            type: 'Text',
            defaultValue: 'retool_wk_5d15a0ab90f34ff88c6a8fbed9488cf2',
            bindable: true,
            section: 'settings',
            options: {
                placeholder: 'retool_wk_...'
            }
        },
        acceptQuoteUrl: {
            label: {
                en: 'Accept Quote URL'
            },
            type: 'Text',
            defaultValue: '',
            bindable: true,
            section: 'settings',
            options: {
                placeholder: 'https://api.retool.com/v1/workflows/YOUR-WORKFLOW-ID/startTrigger'
            }
        },
        acceptApiKey: {
            label: {
                en: 'Accept API Key'
            },
            type: 'Text',
            defaultValue: '',
            bindable: true,
            section: 'settings',
            options: {
                placeholder: 'retool_wk_...'
            }
        },
        validationResponse: {
            label: {
                en: 'Validation Response'
            },
            type: 'Object',
            defaultValue: null,
            bindable: true,
            section: 'data',
            bindingValidation: {
                type: 'object',
                tooltip: 'This field is deprecated - component now handles API calls directly'
            }
        }
    },
    sections: {
        settings: {
            label: {
                en: 'API Configuration'
            },
            defaultOpen: true
        },
        data: {
            label: {
                en: 'Data (Deprecated)'
            },
            defaultOpen: false
        }
    }
};