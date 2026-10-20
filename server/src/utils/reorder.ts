import { prisma } from '../config/prisma';

type SortableModel = 'skill' | 'experience' | 'education' | 'certification' | 'socialLink';

export const nextSortOrder = async (model: SortableModel): Promise<number> => {
  const aggregate = await (prisma[model] as any).aggregate({ _max: { sortOrder: true } });
  return (aggregate._max.sortOrder ?? -1) + 1;
};

export const reorderRecords = async (model: SortableModel, ids: number[]): Promise<void> => {
  await prisma.$transaction(
    ids.map((id, index) =>
      (prisma[model] as any).update({ where: { id }, data: { sortOrder: index + 1 } }),
    ),
  );
};
