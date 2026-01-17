import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

// Helper function to get item ID consistently
const getItemId = (item) => item.product_id || item.productId || item.id;

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (product) => {
        setCart((prevCart) => {
            const productId = getItemId(product);
            const existingItem = prevCart.find((item) => getItemId(item) === productId);
            if (existingItem) {
                return prevCart.map((item) =>
                    getItemId(item) === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Normalize the product to always have product_id
            return [...prevCart, { ...product, product_id: productId, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => getItemId(item) !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart((prevCart) =>
            prevCart.map((item) =>
                getItemId(item) === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        itemCount: cart.reduce((count, item) => count + item.quantity, 0),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
