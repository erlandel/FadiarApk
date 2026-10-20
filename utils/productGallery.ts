import type { ProductID } from '@/types/product';

export type ViewerImage = {
  image: string;
  previewImg?: string | null;
};

export function buildProductGallery(product: ProductID): ViewerImage[] {
  const candidates: ViewerImage[] = [];
  if (product.img_web && product.preview_img_web) {
    candidates.push({ image: product.img_web, previewImg: product.preview_img_web });
  }
  if (product.img) candidates.push({ image: product.img, previewImg: product.preview_img });
  for (const image of product.imagenes ?? []) {
    if (image.img) candidates.push({ image: image.img, previewImg: image.preview_img });
  }

  const unique = new Map<string, ViewerImage>();
  candidates.forEach((image) => {
    const key = image.image.trim().replace(/^\/+/, '');
    if (key && !unique.has(key)) unique.set(key, image);
  });
  return [...unique.values()];
}
