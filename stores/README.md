# Zustand Store Documentation

This project uses Zustand for state management. The stores are organized by domain:

## Store Structure

### 1. Game Store (`gameStore.ts`)

Manages chess game state including:

- Game mode (human-vs-human, human-vs-ai)
- Board position (FEN notation)
- Move history
- Captured pieces
- Time control
- Room code (for online games)
- AI difficulty

**Usage:**

```typescript
import { useGameStore } from '@/stores';

// In a component
const { mode, boardFen, currentPlayer, setGameMode, addMove } = useGameStore();

// Set game mode
setGameMode('human-vs-ai');

// Add a move
addMove('e3e4');

// Reset game
resetGame();
```

### 2. Auth Store (`authStore.ts`)

Manages user authentication and profile:

- User session
- User profile (KNB balance, rating, stats)
- Authentication status

**Usage:**

```typescript
import { useAuthStore } from '@/stores';

// In a component
const { user, profile, isAuthenticated, updateKnb } = useAuthStore();

// Update user KNB after purchase
updateKnb(100);

// Check if authenticated
if (isAuthenticated) {
  // User is logged in
}
```

### 3. Shop Store (`shopStore.ts`)

Manages shop functionality:

- Available items
- Shopping cart
- Purchased items
- Cart totals

**Usage:**

```typescript
import { useShopStore } from '@/stores';

// In a component
const {
  items,
  cart,
  addToCart,
  removeFromCart,
  getCartTotal,
  getCartItemCount,
} = useShopStore();

// Add item to cart
addToCart(item, 1);

// Get cart total
const total = getCartTotal(); // { knb: 500 }

// Get item count
const count = getCartItemCount();
```

### 4. UI Store (`uiStore.ts`)

Manages global UI state:

- Modal states
- Notifications
- Sidebar state
- Loading states

**Usage:**

```typescript
import { useUIStore } from '@/stores';

// In a component
const { isShopModalOpen, openShopModal, closeShopModal, addNotification } =
  useUIStore();

// Open shop modal
openShopModal();

// Show notification
addNotification({
  type: 'success',
  message: 'Purchase successful!',
  duration: 3000,
});
```

## Custom Hooks

### `useCanAfford`

Check if user can afford an item:

```typescript
import { useCanAfford } from '@/stores/hooks';

const canAfford = useCanAfford();
const affordable = canAfford({ price: 100, currency: 'knb' });
```

### `useGameSnapshot`

Get current game state snapshot:

```typescript
import { useGameSnapshot } from '@/stores/hooks';

const snapshot = useGameSnapshot();
// { mode, status, currentPlayer, boardFen, moveCount, isPlaying, isFinished }
```

### `useUserCurrency`

Get user's currency:

```typescript
import { useUserCurrency } from '@/stores/hooks';

const { knb } = useUserCurrency();
```

### `useIsPurchased`

Check if item is purchased:

```typescript
import { useIsPurchased } from '@/stores/hooks';

const isPurchased = useIsPurchased();
if (isPurchased(itemId)) {
  // Item already purchased
}
```

## Best Practices

1. **Selective Subscriptions**: Only subscribe to the state you need

   ```typescript
   // Good - only re-renders when mode changes
   const mode = useGameStore((state) => state.mode);

   // Avoid - re-renders on any game state change
   const gameState = useGameStore();
   ```

2. **Actions**: Use actions instead of directly mutating state

   ```typescript
   // Good
   addMove('e3e4');

   // Avoid
   set({ moveHistory: [...moveHistory, 'e3e4'] });
   ```

3. **Persistence**: Some stores use persistence middleware. Be aware of what's persisted:
   - Game store: Only preferences (mode, difficulty)
   - Auth store: Profile data (not sensitive tokens)
   - Shop store: Purchased items (not cart)

4. **SSR Compatibility**: Stores work with Next.js SSR. The `StoreProvider` component syncs Supabase auth with the auth store.

## Example: Complete Game Component

```typescript
'use client';

import { useGameStore } from '@/stores';
import { useAuthStore } from '@/stores';
import { useUIStore } from '@/stores';

export default function GameBoard() {
  const { boardFen, currentPlayer, addMove, setStatus } = useGameStore();
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();

  const handleMove = (move: string) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        message: 'Please login to play',
      });
      return;
    }

    addMove(move);
    setStatus('playing');
  };

  return (
    <div>
      {/* Game board UI */}
    </div>
  );
}
```

## Example: Shop Component

```typescript
'use client';

import { useShopStore } from '@/stores';
import { useAuthStore } from '@/stores';
import { useCanAfford } from '@/stores/hooks';

export default function Shop() {
  const { items, addToCart, getCartTotal } = useShopStore();
  const { profile, updateKnb } = useAuthStore();
  const canAfford = useCanAfford();

  const handlePurchase = async (item) => {
    if (!canAfford(item)) {
      alert('Not enough currency!');
      return;
    }

    // Process purchase
    updateKnb((profile?.knb ?? 0) - item.price);
  };

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.price} KNB</p>
          <button onClick={() => handlePurchase(item)}>
            Buy
          </button>
        </div>
      ))}
    </div>
  );
}
```
