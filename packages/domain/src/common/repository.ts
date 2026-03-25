export interface Repository<TModel, TId = string> {
  getById(id: TId): Promise<TModel | null>;
  save(model: TModel): Promise<TModel>;
}
