// src/db.ts
var getter;
function configureBillingTenantDb(getTenantDb) {
  getter = getTenantDb;
}
function requireTenantDb(organizationId) {
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
//# sourceMappingURL=chunk-BR5IXYNU.js.map