/**
 * Host-injected tenant DB accessor for billing.
 * This package never imports private `@nebutra/db` (or generated Prisma types).
 */
/** Minimal JSON value for Prisma Json columns. */
type InputJsonValue = string | number | boolean | null | {
    readonly [key: string]: InputJsonValue | undefined;
} | readonly InputJsonValue[];
/**
 * Host Prisma client is treated as a structural black box.
 * Call sites already know the query shapes; typing them fully would re-couple
 * this package to the monorepo schema.
 */
type BillingTenantDb = any;
type TenantDbGetter = (organizationId: string) => unknown;
/**
 * Wire host-owned tenant Prisma (e.g. `getTenantDb` from `@nebutra/db`).
 */
declare function configureBillingTenantDb(getTenantDb: TenantDbGetter): void;

export { type BillingTenantDb as B, type InputJsonValue as I, configureBillingTenantDb as c };
