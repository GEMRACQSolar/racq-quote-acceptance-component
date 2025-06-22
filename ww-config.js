export default {
    editor: {
        label: {
            en: 'Quote Acceptance Display'
        },
        icon: 'check-circle',
        bubble: {
            icon: 'check-circle'
        }
    },
    triggerEvents: [
        {
            name: 'quote:validate',
            label: { en: 'On token validation needed' },
            event: {
                token: '',
                timestamp: ''
            }
        },
        {
            name: 'quote:loaded',
            label: { en: 'Quote data loaded' },
            event: {
                token: '',
                quoteData: {},
                timestamp: ''
            }
        }
    ],
    properties: {
        validationResponse: {
            label: {
                en: 'Validation Response'
            },
            type: 'Object',
            defaultValue: {},
            bindable: true,
            section: 'display',
            bindingValidation: {
                type: 'object',
                tooltip: 'Bind the response from your WeWeb validation workflow here'
            }
        }
    },
    sections: {
        display: {
            label: {
                en: 'Display'
            },
            defaultOpen: true
        },
        settings: {
            label: {
                en: 'Settings'
            },
            defaultOpen: false
        }
    }
};