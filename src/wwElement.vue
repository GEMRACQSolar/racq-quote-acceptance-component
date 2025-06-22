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
      <p>{{ errorMessage }}</p>
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
        <p><strong>Name:</strong> {{ quoteData.customerDetails.data.Name }}</p>
        <p><strong>Email:</strong> {{ quoteData.customerDetails.data.Email }}</p>
        <p><strong>Address:</strong> {{ quoteData.customerDetails.data.Address }}</p>
      </div>

      <div class="quote-summary">
        <h3>{{ quoteData.packageName }}</h3>
        <div class="price-row">
          <span>System Size:</span>
          <span>{{ quoteData.savingsEstimate.systemSize }}kW</span>
        </div>
        <div class="price-row">
          <span>System Price:</span>
          <span>{{ formatCurrency(quoteData.pricing.grossPrice) }}</span>
        </div>
        <div class="price-row">
          <span>STC Rebate:</span>
          <span class="rebate">-{{ formatCurrency(quoteData.pricing.stcRebate) }}</span>
        </div>
        <div class="price-row total">
          <span>Out-of-Pocket Cost:</span>
          <span>{{ formatCurrency(quoteData.pricing.netPrice) }}</span>
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
  emits: ['update:content'],
  data() {
    return {
      loading: true,
      error: false,
      errorMessage: '',
      quoteData: null,
      accepted: false,
      processing: false,
      token: null
    };
  },
  computed: {
    validateTokenUrl() {
      return this.content.validateTokenUrl || '';
    },
    acceptQuoteUrl() {
      return this.content.acceptQuoteUrl || '';
    }
  },
  mounted() {
    this.loadQuoteData();
  },
  methods: {
    async loadQuoteData() {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      this.token = urlParams.get('token');
      
      if (!this.token) {
        this.error = true;
        this.errorMessage = 'No quote token found. Please use the link from your email.';
        this.loading = false;
        return;
      }

      if (!this.validateTokenUrl) {
        this.error = true;
        this.errorMessage = 'Component not configured. Please set the validation URL.';
        this.loading = false;
        return;
      }

      try {
        const response = await fetch(this.validateTokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.token })
        });

        const data = await response.json();
        
        if (data.success) {
          this.quoteData = data.quoteData;
          this.accepted = data.alreadyAccepted || false;
        } else {
          this.error = true;
          this.errorMessage = data.message || 'Invalid or expired quote link.';
        }
      } catch (err) {
        this.error = true;
        this.errorMessage = 'Unable to load quote details. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async confirmQuote() {
      if (!this.acceptQuoteUrl) {
        alert('Component not configured. Please set the acceptance URL.');
        return;
      }

      this.processing = true;
      
      try {
        const response = await fetch(this.acceptQuoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.token })
        });

        const data = await response.json();
        
        if (data.success) {
          this.accepted = true;
        } else {
          alert(data.message || 'Unable to process your request. Please try again.');
        }
      } catch (err) {
        alert('An error occurred. Please try again or contact support.');
      } finally {
        this.processing = false;
      }
    },

    retry() {
      this.error = false;
      this.loading = true;
      this.loadQuoteData();
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
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
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
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

/* Quote Details */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
}

.header-section h1 {
  color: #003478;
  margin-bottom: 10px;
}

.quote-ref {
  color: #666;
  font-size: 14px;
}

.customer-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.customer-info h3 {
  color: #003478;
  margin-top: 0;
}

.customer-info p {
  margin: 8px 0;
  color: #333;
}

.quote-summary {
  background-color: #fff;
  border: 2px solid #FFE600;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.quote-summary h3 {
  color: #003478;
  margin-top: 0;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.price-row.total {
  border-bottom: none;
  border-top: 2px solid #003478;
  margin-top: 10px;
  padding-top: 15px;
  font-weight: bold;
  font-size: 18px;
  color: #003478;
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
  color: #666;
  line-height: 1.6;
  margin-bottom: 25px;
}

.primary-button {
  background-color: #003478;
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.primary-button:hover:not(:disabled) {
  background-color: #002550;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.secondary-button:hover {
  background-color: #5a6268;
}

.disclaimer {
  color: #999;
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
  color: #003478;
  margin-bottom: 20px;
}

.success-message {
  color: #333;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
}

.next-steps {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

.next-steps h3 {
  color: #003478;
  margin-top: 0;
}

.next-steps ul {
  color: #666;
  line-height: 1.8;
  padding-left: 20px;
}

.next-steps li {
  margin-bottom: 8px;
}
</style>