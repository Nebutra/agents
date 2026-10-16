// src/db.ts
var GETTER_KEY = /* @__PURE__ */ Symbol.for("@nebutra/billing/tenant-db-getter");
var holder = globalThis;
function configureBillingTenantDb(getTenantDb) {
  holder[GETTER_KEY] = getTenantDb;
}
function requireTenantDb(organizationId) {
  const getter = holder[GETTER_KEY];
  if (!getter) {
    throw new Error(
      "@nebutra/billing requires a host tenant DB. Call configureBillingTenantDb(getTenantDb) at app bootstrap."
    );
  }
  return getter(organizationId);
}
function isPrismaUniqueViolation(error) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export {
  configureBillingTenantDb,
  requireTenantDb,
  isPrismaUniqueViolation
};
//# sourceMappingURL=chunk-YRG56YLR.js.map