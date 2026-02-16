/**
 * Admin – add new product (images as URLs, video URL, custom fields JSON)
 */
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add product</h1>
      <ProductForm />
    </div>
  );
}
