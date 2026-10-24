import { CrudRequest } from '@dataui/crud';
import { getAsNumberArray } from '@shared/utils/queryParam.util';

interface ServiceWithManyByIds {
  getManyByIds(req: CrudRequest<any, any>, ids: number[]): Promise<object[]>;
}

/**
 * Ids from `req.parsed.extra.ids` that the caller may access (crudAuth filter applied by getManyByIds).
 */
export async function getSelectedIds(service: ServiceWithManyByIds, req: CrudRequest<any, any>): Promise<number[]> {
  const entities = await service.getManyByIds(req, getAsNumberArray(req.parsed.extra.ids));
  return entities.map((entity) => (entity as { id: number }).id);
}
