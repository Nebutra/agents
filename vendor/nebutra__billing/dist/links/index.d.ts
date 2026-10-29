interface CheckoutLinkInput {
    /** Where checkout lives, e.g. `https://app.example.com/checkout`. */
    checkoutUrl: string;
    offerId: string;
    /** Where to send the buyer once paid. Checkout honours first-party pages only. */
    returnTo: string;
    /** A suggested amount for an offer whose buyer names it, in `currency`. */
    amount?: number;
    currency?: "USD" | "CNY";
}
declare function checkoutLink(input: CheckoutLinkInput): string;

export { type CheckoutLinkInput, checkoutLink };
