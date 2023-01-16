import { CreativeWork } from '../interfaces/creative-work';

export const createCreativeWork = (
  props?: Partial<CreativeWork>,
): CreativeWork => {
  return {
    id: props?.id ?? 'item-id',
    owner: props?.owner ?? 'author-id',
  };
};
