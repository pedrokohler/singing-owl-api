import { CreativeWork } from '../interfaces/creative-work';

export const createCreativeWork = (
  props?: Partial<CreativeWork>,
): CreativeWork => {
  return {
    id: props?.id ?? 'item-id',
    author: props?.author ?? 'author-id',
  };
};
