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
            defaultValue: '', // REMOVED hardcoded API key for security
            bindable: true,
            section: 'settings',
            options: {
                placeholder: 'retool_wk_...'
            }
        }
    },
    sections: {
        settings: {
            label: {
                en: 'API Configuration'
            },
            defaultOpen: true
        }
    }
};