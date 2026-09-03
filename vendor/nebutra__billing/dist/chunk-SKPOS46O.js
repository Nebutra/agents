// src/lemonsqueezy/client.ts
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
var initialized = false;
var _storeId = null;
function initLemonSqueezy(config) {
  lemonSqueezySetup({
    apiKey: config.apiKey,
    onError: config.onError
  });
  _storeId = config.storeId;
  initialized = true;
}
function getLemonSqueezyConfig() {
  if (!initialized) {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!apiKey || !storeId) {
      throw new Error(
        "LemonSqueezy credentials not configured (LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID)"
      );
    }
    initLemonSqueezy({ apiKey, storeId });
    return { storeId };
  }
  if (!_storeId) {
    throw new Error("LemonSqueezy storeId not configured");
  }
  return { storeId: _storeId };
}

// src/lemonsqueezy/customers.ts
import {
  cancelSubscription as lsCancelSubscription,
  createCheckout as lsCreateCheckout,
  getCustomer as lsGetCustomer,
  getSubscription as lsGetSubscription
} from "@lemonsqueezy/lemonsqueezy.js";
import { logger } from "@nebutra/logger";
async function createLemonCheckout(options) {
  const { storeId } = getLemonSqueezyConfig();
  const checkoutData = {
    checkoutData: {
      email: options.email,
      name: options.name,
      custom: options.customData,
      discountCode: options.discountCode
    },
    productOptions: {
      redirectUrl: options.redirectUrl
    },
    testMode: options.testMode
  };
  const response = await lsCreateCheckout(storeId, options.variantId, checkoutData);
  if (response.error) {
    logger.error("Failed to create LemonSqueezy checkout", {
      error: response.error.message,
      variantId: options.variantId
    });
    throw new Error(`Failed to create LemonSqueezy checkout: ${response.error.message}`);
  }
  const checkout = response.data;
  const checkoutUrl = checkout?.data?.attributes?.url;
  if (!checkoutUrl) {
    throw new Error("LemonSqueezy checkout created but no URL returned");
  }
  return { checkoutUrl, checkout };
}
async function getLemonSubscription(subscriptionId) {
  getLemonSqueezyConfig();
  const response = await lsGetSubscription(subscriptionId);
  if (response.error) {
    logger.error("Failed to retrieve LemonSqueezy subscription", {
      error: response.error.message,
      subscriptionId: String(subscriptionId)
    });
    throw new Error(`Failed to retrieve LemonSqueezy subscription: ${response.error.message}`);
  }
  if (!response.data) {
    throw new Error(`LemonSqueezy subscription not found: ${subscriptionId}`);
  }
  return response.data;
}
async function cancelLemonSubscription(subscriptionId) {
  getLemonSqueezyConfig();
  const response = await lsCancelSubscription(subscriptionId);
  if (response.error) {
    logger.error("Failed to cancel LemonSqueezy subscription", {
      error: response.error.message,
      subscriptionId: String(subscriptionId)
    });
    throw new Error(`Failed to cancel LemonSqueezy subscription: ${response.error.message}`);
  }
  if (!response.data) {
    throw new Error(`LemonSqueezy subscription not found: ${subscriptionId}`);
  }
  return response.data;
}
async function getLemonCustomerPortalUrl(customerId) {
  getLemonSqueezyConfig();
  const response = await lsGetCustomer(customerId);
  if (response.error) {
    logger.error("Failed to retrieve LemonSqueezy customer", {
      error: response.error.message,
      customerId: String(customerId)
    });
    throw new Error(`Failed to retrieve LemonSqueezy customer: ${response.error.message}`);
  }
  const portalUrl = response.data?.data?.attributes?.urls?.customer_portal;
  if (!portalUrl) {
    throw new Error(
      `Customer portal URL not available for customer ${customerId}. The customer may not have an active subscription.`
    );
  }
  return portalUrl;
}

export {
  initLemonSqueezy,
  getLemonSqueezyConfig,
  createLemonCheckout,
  getLemonSubscription,
  cancelLemonSubscription,
  getLemonCustomerPortalUrl
};
//# sourceMappingURL=chunk-SKPOS46O.js.map