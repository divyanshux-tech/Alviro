import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'alviro_cart';

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Persist to sessionStorage on every cart change
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch {}
    }, [cart]);

    const addToCart = useCallback((dish) => {
        setCart(prev => {
            const id = String(dish._id || dish.menuItemId || dish.id || dish.name);
            const existing = prev.find(i => i._cartId === id);
            if (existing) {
                return prev.map(i => i._cartId === id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [
                ...prev,
                {
                    _cartId: id,
                    menuItemId: dish._id || dish.menuItemId || dish.id || '',
                    name: dish.name,
                    price: dish.price || 0,
                    category: dish.category || 'Mains',
                    image: dish.image || '',
                    quantity: 1
                }
            ];
        });
    }, []);

    const removeFromCart = useCallback((cartId) => {
        setCart(prev => prev.filter(i => i._cartId !== cartId));
    }, []);

    const updateQty = useCallback((cartId, delta) => {
        setCart(prev =>
            prev
                .map(i => i._cartId === cartId ? { ...i, quantity: i.quantity + delta } : i)
                .filter(i => i.quantity > 0)
        );
    }, []);

    const setQty = useCallback((cartId, qty) => {
        const n = Number(qty);
        if (n <= 0) {
            setCart(prev => prev.filter(i => i._cartId !== cartId));
        } else {
            setCart(prev => prev.map(i => i._cartId === cartId ? { ...i, quantity: n } : i));
        }
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const getItemQty = useCallback((cartId) => {
        const item = cart.find(i => i._cartId === cartId);
        return item ? item.quantity : 0;
    }, [cart]);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQty,
            setQty,
            clearCart,
            cartCount,
            cartTotal,
            getItemQty
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
