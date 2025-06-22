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
        }
    },
    sections: {
        settings: {
            label: {
                en: 'Configuration'
            },
            defaultOpen: true
        }
    }
};