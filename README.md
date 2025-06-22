# RACQ Quote Acceptance Component

A WeWeb component for the RACQ Solar quote acceptance page.

## Features

- Token-based quote validation
- Two-step confirmation process
- Displays quote details before confirmation
- Handles multiple states: loading, error, success, already accepted
- RACQ brand styling

## Configuration

In WeWeb, configure the component with:

1. **Validate Token URL**: The Retool webhook URL that validates the token and returns quote data
2. **Accept Quote URL**: The Retool webhook URL that processes the quote acceptance

## Expected API Responses

### Validate Token Endpoint

```json
{
  "success": true,
  "quoteData": {
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
  },
  "alreadyAccepted": false
}
```

### Accept Quote Endpoint

```json
{
  "success": true,
  "message": "Quote accepted successfully"
}
```

## Development

```bash
npm install
npm run serve
```

## Production

```bash
npm run build
```