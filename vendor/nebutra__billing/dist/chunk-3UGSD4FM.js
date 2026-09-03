// src/polar/client.ts
import { Polar } from "@polar-sh/sdk";
var polarClient = null;
function initPolar(config) {
  polarClient = new Polar({
    accessToken: config.accessToken,
    server: config.server ?? "production"
  });
  return polarClient;
}
function getPolar() {
  if (!polarClient) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("Polar not initialized. Call initPolar() or set POLAR_ACCESS_TOKEN");
    }
    return initPolar({
      accessToken,
      server: process.env.POLAR_SANDBOX === "true" ? "sandbox" : "production"
    });
  }
  return polarClient;
}

// src/polar/customers.ts
import { logger } from "@nebutra/logger";
async function createPolarCheckout(options) {
  const polar = getPolar();
  try {
    return await polar.checkouts.create({
      products: [options.productId],
      successUrl: options.successUrl,
      customerEmail: options.customerEmail,
      metadata: options.metadata
    });
  } catch (error) {
    logger.error("Failed to create Polar checkout session", { error });
    throw new Error("Failed to create Polar checkout session");
  }
}
async function getPolarSubscription(subscriptionId) {
  const polar = getPolar();
  try {
    return await polar.subscriptions.get({ id: subscriptionId });
  } catch (error) {
    logger.error("Failed to get Polar subscription", {
      subscriptionId,
      error
    });
    throw new Error(`Failed to get Polar subscription: ${subscriptionId}`);
  }
}
async function cancelPolarSubscription(subscriptionId) {
  const polar = getPolar();
  try {
    return await polar.subscriptions.revoke({ id: subscriptionId });
  } catch (error) {
    logger.error("Failed to cancel Polar subscription", {
      subscriptionId,
      error
    });
    throw new Error(`Failed to cancel Polar subscription: ${subscriptionId}`);
  }
}
async function listPolarProducts() {
  const polar = getPolar();
  try {
    const pages = await polar.products.list({});
    const products = [];
    for await (const page of pages) {
      products.push(...page.result.items);
    }
    return products;
  } catch (error) {
    logger.error("Failed to list Polar products", { error });
    throw new Error("Failed to list Polar products");
  }
}

export {
  initPolar,
  getPolar,
  createPolarCheckout,
  getPolarSubscription,
  cancelPolarSubscription,
  listPolarProducts
};
//# sourceMappingURL=chunk-3UGSD4FM.js.map