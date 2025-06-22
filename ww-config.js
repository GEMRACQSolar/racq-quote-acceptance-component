module.exports = {
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
        }
    ],
    properties: {
        validateTokenUrl: {
            label: {
                en: 'Validate Token URL'
            },
            type: 'Text',
            defaultValue: '',
            bindable: true,
            section: 'settings',
            options: {
                placeholder: 'https://your-retool-webhook.com/validate-token'
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
                placeholder: 'https://your-retool-webhook.com/accept-quote'
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
                tooltip: 'Bind the response from your validation workflow here'
            }
        }
    },
    sections: {
        settings: {
            label: {
                en: 'Configuration'
            },
            defaultOpen: true
        },
        data: {
            label: {
                en: 'Data'
            },
            defaultOpen: false
        }
    }
};