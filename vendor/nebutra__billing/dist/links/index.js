// src/links/index.ts
function checkoutLink(input) {
  const url = new URL(input.checkoutUrl);
  url.searchParams.set("offer", input.offerId);
  if (input.amount !== void 0 && input.currency) {
    url.searchParams.set("amount", String(input.amount));
    url.searchParams.set("currency", input.currency);
  }
  url.searchParams.set("returnTo", input.returnTo);
  return url.toString();
}
export {
  checkoutLink
};
//# sourceMappingURL=index.js.map