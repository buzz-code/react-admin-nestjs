import { getSelectedIds } from '../selectedIds.util';

describe('getSelectedIds', () => {
  it('returns ids of entities resolved from req.parsed.extra.ids', async () => {
    const service = { getManyByIds: jest.fn().mockResolvedValue([{ id: 1 }, { id: 3 }]) };
    const req: any = { parsed: { extra: { ids: '1,2,3' } } };

    await expect(getSelectedIds(service, req)).resolves.toEqual([1, 3]);
    expect(service.getManyByIds).toHaveBeenCalledWith(req, [1, 2, 3]);
  });

  it('returns empty array when nothing resolves', async () => {
    const service = { getManyByIds: jest.fn().mockResolvedValue([]) };
    const req: any = { parsed: { extra: {} } };

    await expect(getSelectedIds(service, req)).resolves.toEqual([]);
  });
});
