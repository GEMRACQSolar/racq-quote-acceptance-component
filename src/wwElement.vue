<template>
  <div class="quote-acceptance-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Retrieving your quote details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Unable to Load Quote</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <button class="secondary-button" @click="retry">Try Again</button>
    </div>

    <!-- Success State - Quote Details -->
    <div v-else-if="quoteData && !accepted" class="quote-details">
      <div class="header-section">
        <h1>Confirm Your Quote Request</h1>
        <p class="quote-ref">Quote Reference: #{{ quoteData.quoteId }}</p>
      </div>

      <div class="customer-info">
        <h3>Your Details</h3>
        <p><strong>Name:</strong> {{ quoteData.customerDetails?.data?.Name }}</p>
        <p><strong>Email:</strong> {{ quoteData.customerDetails?.data?.Email }}</p>
        <p><strong>Address:</strong> {{ quoteData.customerDetails?.data?.Address }}</p>
      </div>

      <div class="quote-summary">
        <h3>{{ quoteData.packageName }}</h3>
        <div class="price-row">
          <span>System Size:</span>
          <span>{{ quoteData.savingsEstimate?.systemSize }}kW</span>
        </div>
        <div class="price-row">
          <span>System Price:</span>
          <span>{{ formatCurrency(quoteData.pricing?.grossPrice) }}</span>
        </div>
        <div class="price-row">
          <span>STC Rebate:</span>
          <span class="rebate">-{{ formatCurrency(quoteData.pricing?.stcRebate) }}</span>
        </div>
        <div class="price-row total">
          <span>Out-of-Pocket Cost:</span>
          <span>{{ formatCurrency(quoteData.pricing?.netPrice) }}</span>
        </div>
      </div>

      <div class="action-section">
        <p class="explanation">
          By clicking the button below, you're confirming your interest in receiving a formal quote. 
          An RACQ Solar consultant will contact you within 24 hours to conduct a detailed assessment 
          and prepare your binding proposal.
        </p>
        
        <button 
          class="primary-button" 
          @click="confirmQuote"
          :disabled="processing"
        >
          {{ processing ? 'Processing...' : 'Confirm Quote Request' }}
        </button>

        <p class="disclaimer">
          This action does not commit you to purchase. You'll have the opportunity to review 
          and accept the formal proposal after consultation.
        </p>
      </div>
    </div>

    <!-- Already Accepted State -->
    <div v-else-if="accepted" class="success-state">
      <div class="success-icon">✅</div>
      <h2>Quote Request Confirmed!</h2>
      <p class="success-message">
        Thank you for your interest! An RACQ Solar team member will contact you 
        within 24 hours to discuss your solar solution and prepare your formal quote.
      </p>
      <div class="next-steps">
        <h3>What happens next?</h3>
        <ul>
          <li>Solar consultant will call to discuss your needs</li>
          <li>Remote or on-site assessment of your property</li>
          <li>Formal proposal prepared for your review</li>
        </ul>
      </div>
    </div>

    <!-- Initial Loading (no token) State -->
    <div v-else-if="!token && !loading" class="no-token-state">
      <div class="error-icon">🔗</div>
      <h2>No Quote Found</h2>
      <p>Please use the link from your email to access your quote.</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: Object, default: () => ({}) },
    /* wwEditor:start */
    wwEditorState: { type: Object, required: true },
    /* wwEditor:end */
  },
  emits: ['update:content', 'trigger-event'],
  data() {
    return {
      loading: false,
      error: false,
      errorMessage: '',
      quoteData: null,
      accepted: false,
      processing: false,
      token: null
    };
  },
  computed: {
    // Get webhook URLs from WeWeb configuration or use defaults
    validateUrl() {
      return this.content.validateTokenUrl || 'https://api.retool.com/v1/workflows/7ecf25b7-d8ff-4c0f-b879-1d2f60d255a2/startTrigger';
    },
    validateApiKey() {
      return this.content.validateApiKey || 'retool_wk_5d15a0ab90f34ff88c6a8fbed9488cf2';
    },
    acceptUrl() {
      return this.content.acceptQuoteUrl || 'https://api.retool.com/v1/workflows/YOUR-ACCEPT-WORKFLOW-ID/startTrigger';
    },
    acceptApiKey() {
      return this.content.acceptApiKey || '';
    }
  },
  mounted() {
    console.log('🚀 Quote Acceptance Component Mounted');
    console.log('Validation URL:', this.validateUrl);
    console.log('Accept URL:', this.acceptUrl);
    this.initializeComponent();
  },
  methods: {
    async initializeComponent() {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
      
      console.log('🔍 Token from URL:', this.token);
      
      if (!this.token) {
        this.loading = false;
        return;
      }

      // Start loading and validate the token
      this.loading = true;
      await this.validateToken();
    },

    async validateToken() {
      try {
        console.log('📤 Calling validation webhook...');
        console.log('URL:', this.validateUrl);
        
        const response = await fetch(this.validateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Workflow-Api-Key': this.validateApiKey
          },
          body: JSON.stringify({
            token: this.token
          })
        });

        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Validation response:', data);

        this.handleValidationResponse(data);
        
      } catch (err) {
        console.error('💥 Error validating token:', err);
        this.loading = false;
        this.error = true;
        this.errorMessage = 'Unable to connect to the server. Please try again later.';
      }
    },

    handleValidationResponse(response) {
      console.log('📥 Processing validation response...');
      this.loading = false;
      
      try {
        if (response.success) {
          console.log('✅ Validation successful');
          
          // The response structure based on your logs shows the quote data is in acceptanceRecord.quote_data
          if (response.acceptanceRecord?.quote_data) {
            this.quoteData = response.acceptanceRecord.quote_data;
            console.log('Quote data extracted:', this.quoteData);
          } else {
            throw new Error('Quote data not found in response');
          }
          
          // Check if already accepted
          this.accepted = response.alreadyAccepted || false;
          
        } else {
          console.log('❌ Validation failed');
          this.error = true;
          this.errorMessage = response.error || 'Invalid or expired quote link.';
        }
      } catch (err) {
        console.error('💥 Error processing response:', err);
        this.error = true;
        this.errorMessage = 'Error processing quote data: ' + err.message;
      }
    },

    async confirmQuote() {
      if (!this.acceptUrl || this.acceptUrl.includes('YOUR-ACCEPT-WORKFLOW-ID')) {
        alert('Accept quote webhook URL not configured. Please contact support.');
        return;
      }

      this.processing = true;
      
      try {
        console.log('📤 Confirming quote acceptance...');
        
        const headers = {
          'Content-Type': 'application/json'
        };
        
        // Add API key if provided
        if (this.acceptApiKey) {
          headers['X-Workflow-Api-Key'] = this.acceptApiKey;
        }
        
        const response = await fetch(this.acceptUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            token: this.token,
            quoteId: this.quoteData.quoteId,
            customerEmail: this.quoteData.customerDetails?.data?.Email
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Acceptance response:', data);

        this.handleAcceptanceResponse(data);
        
      } catch (err) {
        console.error('💥 Error accepting quote:', err);
        this.processing = false;
        alert('Unable to process your request. Please try again later.');
      }
    },

    handleAcceptanceResponse(response) {
      this.processing = false;
      
      if (response.success) {
        this.accepted = true;
        // Emit event for WeWeb tracking if needed
        this.$emit('trigger-event', {
          name: 'quote:accepted',
          event: {
            token: this.token,
            quoteId: this.quoteData.quoteId,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        alert(response.message || 'Unable to process your request. Please try again.');
      }
    },

    retry() {
      this.error = false;
      this.errorMessage = '';
      this.initializeComponent();
    },

    formatCurrency(amount) {
      if (!amount) return '$0';
      const num = typeof amount === 'string' ? parseFloat(amount.replace(/[$,]/g, '')) : amount;
      return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(num);
    }
  }
};
</script>

<style scoped>
.quote-acceptance-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #000813;
  min-height: 100vh;
  color: #ffffff;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #FFE600;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state, .no-token-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-state h2, .no-token-state h2 {
  color: #ffffff;
  margin-bottom: 20px;
}

.error-message {
  color: #cccccc;
  margin-bottom: 30px;
}

.no-token-state p {
  color: #cccccc;
}

/* Quote Details */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
}

.header-section h1 {
  color: #FFE600;
  margin-bottom: 10px;
}

.quote-ref {
  color: #cccccc;
  font-size: 14px;
}

.customer-info {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.customer-info h3 {
  color: #FFE600;
  margin-top: 0;
}

.customer-info p {
  margin: 8px 0;
  color: #ffffff;
}

.quote-summary {
  background-color: rgba(255, 230, 0, 0.05);
  border: 2px solid #FFE600;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.quote-summary h3 {
  color: #FFE600;
  margin-top: 0;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.price-row.total {
  border-bottom: none;
  border-top: 2px solid #FFE600;
  margin-top: 10px;
  padding-top: 15px;
  font-weight: bold;
  font-size: 18px;
  color: #FFE600;
}

.rebate {
  color: #92C467;
  font-weight: 600;
}

/* Action Section */
.action-section {
  text-align: center;
}

.explanation {
  color: #cccccc;
  line-height: 1.6;
  margin-bottom: 25px;
}

.primary-button {
  background-color: #FFE600;
  color: #000813;
  border: none;
  padding: 15px 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-button:hover:not(:disabled) {
  background-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 230, 0, 0.3);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #FFE600;
}

.disclaimer {
  color: #999999;
  font-size: 14px;
  margin-top: 20px;
  font-style: italic;
}

/* Success State */
.success-state {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.success-state h2 {
  color: #FFE600;
  margin-bottom: 20px;
}

.success-message {
  color: #ffffff;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.next-steps {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 25px;
  border-radius: 8px;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.next-steps h3 {
  color: #FFE600;
  margin-top: 0;
}

.next-steps ul {
  color: #cccccc;
  line-height: 1.8;
  padding-left: 20px;
}

.next-steps li {
  margin-bottom: 8px;
}
</style>