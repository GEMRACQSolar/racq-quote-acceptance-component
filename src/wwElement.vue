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
    <div v-else-if="quoteData" class="quote-details">
      <div class="header-section">
        <h1>Your Solar Quote</h1>
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

      <slot></slot>
    </div>

    <!-- No Token State -->
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
      token: null
    };
  },
  computed: {
    // Watch for validation response from WeWeb workflow
    validationResponse() {
      return this.content.validationResponse;
    }
  },
  watch: {
    validationResponse: {
      handler(newValue) {
        console.log('📊 ValidationResponse changed:', newValue);
        if (newValue && Object.keys(newValue).length > 0) {
          this.handleValidationResponse(newValue);
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    console.log('🚀 Quote Acceptance Component Mounted');
    console.log('Initial content:', this.content);
    console.log('Initial validationResponse:', this.validationResponse);
    this.initializeComponent();
  },
  methods: {
    initializeComponent() {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
      
      console.log('🔍 Token from URL:', this.token);
      
      if (!this.token) {
        this.loading = false;
        return;
      }

      // Check if we already have validation response
      if (this.validationResponse && Object.keys(this.validationResponse).length > 0) {
        console.log('📦 Found existing validation response');
        this.handleValidationResponse(this.validationResponse);
        return;
      }

      this.loading = true;

      // Emit event for WeWeb to handle token validation
      console.log('📤 Emitting quote:validate event for WeWeb workflow');
      this.$emit('trigger-event', {
        name: 'quote:validate',
        event: {
          token: this.token,
          timestamp: new Date().toISOString()
        }
      });
    },

    handleValidationResponse(response) {
      console.log('📥 handleValidationResponse called with:', response);
      this.loading = false;
      
      try {
        if (response.success) {
          console.log('✅ Validation successful');
          
          // The response structure based on your logs shows the quote data is in acceptanceRecord.quote_data
          if (response.acceptanceRecord?.quote_data) {
            this.quoteData = response.acceptanceRecord.quote_data;
            console.log('Quote data extracted:', this.quoteData);
            
            // Emit event to let WeWeb know quote is loaded
            this.$emit('trigger-event', {
              name: 'quote:loaded',
              event: {
                token: this.token,
                quoteData: this.quoteData,
                timestamp: new Date().toISOString()
              }
            });
          } else {
            throw new Error('Quote data not found in response');
          }
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

    retry() {
      this.error = false;
      this.errorMessage = '';
      this.loading = true;
      
      // Re-emit validation event
      this.$emit('trigger-event', {
        name: 'quote:validate',
        event: {
          token: this.token,
          timestamp: new Date().toISOString()
        }
      });
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
</style>