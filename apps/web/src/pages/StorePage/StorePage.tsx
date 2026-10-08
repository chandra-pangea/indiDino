// Store page: browse the catalog, filter by category, and add products to the cart.
import { useProducts } from '../../features/products/useProducts';
import { useCart } from '../../features/cart/useCart';
import { useToast } from '../../components/Toast/ToastProvider';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { Spinner } from '../../components/Spinner/Spinner';
import styles from './StorePage.module.css';

// Renders the category filters and the product grid.
export function StorePage() {
  const { products, categories, isLoading, categorySlug, setCategorySlug } = useProducts();
  const { addItem } = useCart();
  const { showToast } = useToast();

  // Adds a product to the cart and shows feedback.
  const handleAdd = async (productId: string) => {
    try {
      await addItem(productId);
      showToast('Added to cart');
    } catch {
      showToast('Could not add to cart', 'error');
    }
  };

  return (
    <div className="container">
      <h1 className="section-title">Store</h1>

      <div className={styles.filters}>
        <button
          className={[styles.filter, !categorySlug ? styles.filterActive : ''].join(' ')}
          onClick={() => setCategorySlug(undefined)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={[styles.filter, categorySlug === category.slug ? styles.filterActive : ''].join(' ')}
            onClick={() => setCategorySlug(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
