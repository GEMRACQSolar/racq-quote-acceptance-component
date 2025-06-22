# RACQ Quote Acceptance Component

A WeWeb component for the RACQ Solar quote acceptance page.

## Features

- Token-based quote validation
- WeWeb workflow integration via Validation Response property
- Displays quote details before confirmation
- Handles multiple states: loading, error, success
- RACQ brand styling

## Configuration in WeWeb

### 1. Validation Response Property

Bind your WeWeb workflow response to the component's **Validation Response** property:

1. In the component properties panel, find "Validation Response"
2. Click the binding icon (fx button)
3. Simply select or type: `quoteAcceptanceData`

The component will automatically update when your workflow populates this variable with the Retool response.

### 2. Workflow Setup

Your WeWeb workflow should:

1. Listen for the `quote:validate` event from the component
2. Call your Retool webhook with the token
3. Store the response in your bound variable (e.g., `quoteAcceptanceData`)

## Expected Validation Response Format

```json
{
  "success": true,
  "acceptanceRecord": {
    "quote_data": {
      "quoteId": "12345",
      "packageName": "RACQ Solar 6.6kW - PV Only",
      "customerDetails": {
        "data": {
          "Name": "John Doe",
          "Email": "john@example.com",
          "Address": "123 Main St, Brisbane, QLD 4000"
        }
      },
      "pricing": {
        "grossPrice": 8000,
        "stcRebate": 2000,
        "netPrice": 6000
      },
      "savingsEstimate": {
        "systemSize": "6.6"
      }
    }
  }
}
```

## Events Emitted

- **quote:validate**: Fired when component needs token validation
- **quote:loaded**: Fired when quote data is successfully loaded

## Development

```bash
npm install
npm run serve
```

## Production

```bash
npm run build
```
