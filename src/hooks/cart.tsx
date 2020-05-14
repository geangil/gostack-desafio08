import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStoraged = await AsyncStorage.getItem(
        '@GoMarketPlace:products',
      );

      if (productsStoraged) {
        setProducts(JSON.parse(productsStoraged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const indexProduct = products.findIndex(prod => prod.id === product.id);

      if (indexProduct !== -1) {
        const newListProduct = [...products];
        const updatedProduct = {
          ...newListProduct[indexProduct],
          quantity: newListProduct[indexProduct].quantity + 1,
        };
        newListProduct[indexProduct] = updatedProduct;
        setProducts(newListProduct);
      } else {
        const newProduct = { ...product, quantity: 1 };
        setProducts([...products, newProduct]);
      }
      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const indexProduct = products.findIndex(prod => prod.id === id);

      if (indexProduct !== -1) {
        const newListProduct = [...products];
        const updatedProduct = {
          ...newListProduct[indexProduct],
          quantity: newListProduct[indexProduct].quantity + 1,
        };
        newListProduct[indexProduct] = updatedProduct;
        setProducts(newListProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const indexProduct = products.findIndex(prod => prod.id === id);

      if (indexProduct !== -1) {
        const newListProduct = [...products];
        if (products[indexProduct].quantity > 1) {
          newListProduct[indexProduct] = {
            ...newListProduct[indexProduct],
            quantity: newListProduct[indexProduct].quantity - 1,
          };
        } else {
          newListProduct.splice(indexProduct, 1);
        }
        setProducts(newListProduct);
      }

      await AsyncStorage.setItem(
        '@GoMarketPlace:produtcs',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
