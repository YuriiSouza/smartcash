"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  id: string
  title: string
  price: string
  originalPrice: string
  type: string
  image?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        return {
          ...state,
          items: updatedItems,
          itemCount: state.itemCount + 1,
          total: calculateTotal(updatedItems),
        }
      }

      const newItems = [...state.items, { ...action.payload, quantity: 1 }]
      return {
        ...state,
        items: newItems,
        itemCount: state.itemCount + 1,
        total: calculateTotal(newItems),
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        total: calculateTotal(newItems),
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      return {
        ...state,
        items: newItems,
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        total: calculateTotal(newItems),
      }
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
      }

    case "LOAD_CART":
      return {
        items: action.payload,
        itemCount: action.payload.reduce((sum, item) => sum + item.quantity, 0),
        total: calculateTotal(action.payload),
      }

    default:
      return state
  }
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = Number.parseFloat(item.price.replace("R$ ", "").replace(",", "."))
    return sum + price * item.quantity
  }, 0)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
