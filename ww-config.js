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
        // No configuration needed - everything is self-contained
    }
};