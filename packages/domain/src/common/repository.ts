import type { TenantContext } from "./types";

export interface Repository<TModel, TId = string> {
  getById(context: TenantContext, id: TId): Promise<TModel | null>;
  save(context: TenantContext, model: TModel): Promise<TModel>;
}
