// Catalog product card with an add-to-cart button.
import type { Product } from '../../types';
import { Card } from '../Card/Card';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { CoinAmount } from '../CoinAmount/CoinAmount';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAdd: (productId: string) => void;
}

// Renders a product's image, details, price, and add action.
export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <Card className={styles.card}>
      <img className={styles.image} src={product.imageUrl} alt={product.name} />
      <div className={styles.body}>
        {product.category ? <Badge>{product.category.name}</Badge> : null}
        <div className={styles.name}>{product.name}</div>
        <div className={styles.description}>{product.description}</div>
        <div className={styles.footer}>
          <CoinAmount amount={product.priceCoins} />
          <Button onClick={() => onAdd(product.id)}>Add to cart</Button>
        </div>
      </div>
    </Card>
  );
}
