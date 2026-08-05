import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus, Minus, Trash2, Edit, Coffee, GlassWater, Leaf, CupSoda,
  ClipboardList, ShoppingCart, RotateCcw,
} from 'lucide-react';
import { useSerialJoin } from '../hooks/useJoin';
import { SERIAL_JOINS } from '../crestron/joins';
import { safeLocalStorage } from '../utils/safeStorage';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import EditMenuModal from '../components/modals/EditMenuModal';
import orderPlacedSound from '../assets/sounds/order-placed.mp3';


const DEFAULT_MENU_ITEMS = [
  'Water', 'Cappuccino Coffee', 'Latte Coffee', 'Espresso Coffee',
  'Ginger Tea', 'Black Tea', 'Lemon Tea', 'Masala Tea', 'Green Tea'
];

// Keep the stored order history bounded — a panel that never gets cleared
// would otherwise grow this array forever.
const MAX_STORED_ORDERS = 100;

// Double-tap guard on the Order button (panel taps register twice easily)
const SUBMIT_LOCK_MS = 1200;

// How long the "Undo clear" affordance stays available
const UNDO_WINDOW_SECONDS = 8;


// --- Item icon mapping (first match wins) ---
const ITEM_ICON_RULES = [
  { match: /water|juice|soda/i, icon: GlassWater },
  { match: /coffee|cappuccino|latte|espresso|mocha|americano/i, icon: Coffee },
  { match: /tea|chai/i, icon: Leaf },
];

const getItemIcon = (name = '') =>
  ITEM_ICON_RULES.find((rule) => rule.match.test(name))?.icon ?? CupSoda;


const CafePage = ({ sidebarEnabled = false }) => {
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = safeLocalStorage.getItem('cafe_menu_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MENU_ITEMS;
      }
      return DEFAULT_MENU_ITEMS;
    } catch (error) {
      console.error('Failed to load menu from safeLocalStorage:', error);
      return DEFAULT_MENU_ITEMS;
    }
  });

  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(menuItems[0]);
  const [orderSummary, setOrderSummary] = useState([]);

  // Undo-after-clear
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);

  // Submit lock
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const submitTimerRef = useRef(null);

  const [, setCafeOrderListText] = useSerialJoin(SERIAL_JOINS.CAFE_ORDER_LIST, '');

  useEffect(() => {
    safeLocalStorage.setItem('cafe_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    if (!menuItems.includes(selectedItem)) {
      setSelectedItem(menuItems[0] || '');
    }
  }, [menuItems, selectedItem]);

  // Undo countdown
  useEffect(() => {
    if (!undoSnapshot) return undefined;
    if (undoSecondsLeft <= 0) {
      setUndoSnapshot(null);
      return undefined;
    }
    const timer = setTimeout(() => setUndoSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [undoSnapshot, undoSecondsLeft]);

  // Clear the submit lock timer if the page unmounts mid-lock
  useEffect(() => () => {
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
  }, []);

  const totalItems = useMemo(
    () => orderSummary.reduce((sum, item) => sum + item.quantity, 0),
    [orderSummary]
  );

  const selectedQty = useMemo(
    () => orderSummary.find((item) => item.name === selectedItem)?.quantity ?? 0,
    [orderSummary, selectedItem]
  );

  const orderCountByName = useMemo(() => {
    const map = {};
    orderSummary.forEach((item) => { map[item.name] = item.quantity; });
    return map;
  }, [orderSummary]);

  const dismissUndo = () => {
    if (undoSnapshot) {
      setUndoSnapshot(null);
      setUndoSecondsLeft(0);
    }
  };

  const handleSaveMenu = (newMenu) => {
    setMenuItems(newMenu);
    window.showToast?.('✅ Menu saved successfully', 'success');
  };

  // --- One-tap ordering: tapping a tile selects it AND adds one ---
  const handleTileTap = (itemName) => {
    dismissUndo();
    setSelectedItem(itemName);
    setOrderSummary((prev) => {
      const existing = prev.find((item) => item.name === itemName);
      if (existing) {
        return prev.map((item) =>
          item.name === itemName ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { name: itemName, quantity: 1 }];
    });
  };

  const handleQtyChangeInSummary = (itemName, newQty) => {
    dismissUndo();
    if (newQty < 1) {
      setOrderSummary((prev) => prev.filter((item) => item.name !== itemName));
      return;
    }
    setOrderSummary((prev) =>
      prev.map((item) => (item.name === itemName ? { ...item, quantity: newQty } : item))
    );
  };

  const handleDeleteFromOrder = (itemName) => {
    dismissUndo();
    setOrderSummary((prev) => prev.filter((item) => item.name !== itemName));
  };

  const handleClearAll = () => {
    if (orderSummary.length === 0) return;
    setUndoSnapshot(orderSummary);
    setUndoSecondsLeft(UNDO_WINDOW_SECONDS);
    setOrderSummary([]);
    window.showToast?.('🧹 Order cleared — you can undo this', 'info', 4000);
  };

  const handleUndoClear = () => {
    if (!undoSnapshot) return;
    setOrderSummary(undoSnapshot);
    setUndoSnapshot(null);
    setUndoSecondsLeft(0);
    window.showToast?.('↩️ Order restored', 'success', 2000);
  };

  const getNextOrderId = () => {
    try {
      const saved = safeLocalStorage.getItem('cafe_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        if (Array.isArray(orders) && orders.length > 0) {
          const maxId = Math.max(...orders.map((order) => order.id));
          return maxId + 1;
        }
      }
      return 1;
    } catch (error) {
      console.error('❌ Failed to get next order ID:', error);
      return 1;
    }
  };

  const handleOrderSubmit = () => {
    if (submitLockRef.current) return;
    if (orderSummary.length === 0) {
      window.showToast?.('Please add items to your order', 'error');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    const orderId = getNextOrderId();
    const itemsString = orderSummary.map((item) => `${item.name},${item.quantity}`).join('|');
    const newOrder = { id: orderId, items: itemsString, status: 'pending' };

    try {
      const saved = safeLocalStorage.getItem('cafe_orders');
      const orders = saved ? JSON.parse(saved) : [];
      orders.push(newOrder);
      // Keep only the most recent N orders
      const trimmed = orders.slice(-MAX_STORED_ORDERS);
      safeLocalStorage.setItem('cafe_orders', JSON.stringify(trimmed));
    } catch (error) {
      console.error('❌ Failed to save order:', error);
    }

    setCafeOrderListText(itemsString);

    const audio = new Audio(orderPlacedSound);
    audio.volume = 0.7;
    audio.play().catch((e) => console.warn('🔇 Order placed sound failed:', e));

    setOrderSummary([]);
    dismissUndo();
    window.showToast?.('✅ Order submitted successfully!', 'success', 10000);

    submitTimerRef.current = setTimeout(() => {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }, SUBMIT_LOCK_MS);
  };

  const headerBorder = { borderColor: 'var(--color-border)' };
  const insetSurface = {
    backgroundColor: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
  };

  return (
    <div className="h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex overflow-hidden">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 overflow-hidden ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>

        {/* ── LEFT: Select Item ─────────────────────────────────── */}
        <Card
          variant="glass"
          className="flex-[1.3] min-w-0 flex flex-col overflow-hidden"
          style={{ padding: 0 }}
        >
          <CardHeader
            className="px-4 py-3 touchPanel:px-6 touchPanel:py-4 border-b flex-shrink-0"
            style={{ ...headerBorder, marginBottom: 0 }}
          >
            <div className="flex items-center justify-between gap-3 w-full">
              <CardTitle className="flex items-center gap-2 text-base touchPanel:text-2xl font-bold">
                <Coffee className="w-5 h-5 touchPanel:w-7 touchPanel:h-7 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>Select Item</span>
              </CardTitle>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditMenuOpen(true)}
                className="flex items-center gap-2 touchPanel:px-5 touchPanel:py-3"
              >
                <Edit className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                <span className="text-sm touchPanel:text-base">Edit Menu</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 flex flex-col gap-3 touchPanel:gap-4 px-4 py-4 touchPanel:px-6 touchPanel:py-5">
            {/* Menu grid */}
            <div
              className="flex-1 min-h-0 overflow-y-auto rounded-xl p-3 touchPanel:p-4"
              style={insetSurface}
            >
              <div className="grid grid-cols-2 touchPanel:grid-cols-3 gap-3 touchPanel:gap-4">
                {menuItems.map((item) => {
                  const ItemIcon = getItemIcon(item);
                  const count = orderCountByName[item] ?? 0;
                  const isSelected = selectedItem === item;
                  const inOrder = count > 0;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleTileTap(item)}
                      className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 touchPanel:p-6 min-h-[92px] touchPanel:min-h-[132px] transition-all duration-200 active:scale-[0.97] select-none"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))'
                          : inOrder
                            ? 'color-mix(in srgb, var(--color-primary) 10%, var(--color-bg-secondary))'
                            : 'var(--color-bg-secondary)',
                        borderColor: isSelected
                          ? 'transparent'
                          : inOrder
                            ? 'color-mix(in srgb, var(--color-primary) 45%, var(--color-border))'
                            : 'var(--color-border)',
                        color: isSelected ? '#ffffff' : 'var(--color-heading)',
                        boxShadow: isSelected
                          ? '0 8px 22px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                          : '0 4px 14px color-mix(in srgb, var(--color-shadow) 10%, transparent)',
                      }}
                    >
                      {count > 0 && (
                        <span
                          className="absolute top-2 right-2 min-w-[24px] h-6 touchPanel:min-w-[30px] touchPanel:h-8 px-1.5 rounded-full flex items-center justify-center text-xs touchPanel:text-base font-bold"
                          style={{
                            backgroundColor: isSelected ? '#ffffff' : 'var(--color-primary)',
                            color: isSelected ? 'var(--color-primary)' : '#ffffff',
                          }}
                        >
                          {count}
                        </span>
                      )}

                      <ItemIcon
                        className="w-6 h-6 touchPanel:w-9 touchPanel:h-9 flex-shrink-0"
                        style={{ opacity: isSelected ? 0.95 : 0.75 }}
                      />
                      <span className="text-sm touchPanel:text-lg font-semibold text-center leading-tight">
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected-item quantity strip */}
            <div
              className="flex-shrink-0 rounded-xl px-3 py-2.5 touchPanel:px-4 touchPanel:py-3.5 flex items-center justify-between gap-3"
              style={insetSurface}
            >
              {selectedQty > 0 ? (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] touchPanel:text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-light)' }}>
                      Adjust quantity
                    </p>
                    <p className="text-sm touchPanel:text-lg font-semibold truncate text-heading">
                      {selectedItem}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 touchPanel:gap-3 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQtyChangeInSummary(selectedItem, selectedQty - 1)}
                      className="px-3 py-2 touchPanel:px-5 touchPanel:py-3"
                    >
                      <Minus className="w-4 h-4 touchPanel:w-6 touchPanel:h-6" />
                    </Button>
                    <span className="text-lg touchPanel:text-2xl font-bold text-heading w-8 touchPanel:w-12 text-center">
                      {selectedQty}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleQtyChangeInSummary(selectedItem, selectedQty + 1)}
                      className="px-3 py-2 touchPanel:px-5 touchPanel:py-3"
                    >
                      <Plus className="w-4 h-4 touchPanel:w-6 touchPanel:h-6" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteFromOrder(selectedItem)}
                      className="px-3 py-2 touchPanel:px-5 touchPanel:py-3"
                    >
                      <Trash2 className="w-4 h-4 touchPanel:w-6 touchPanel:h-6" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs touchPanel:text-base text-center w-full" style={{ color: 'var(--color-text-light)' }}>
                  Tap an item to add it — tap again for more
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── RIGHT: Order Summary ──────────────────────────────── */}
        <Card
          variant="glass"
          className="flex-[1] min-w-0 flex flex-col overflow-hidden"
          style={{ padding: 0 }}
        >
          <CardHeader
            className="px-4 py-3 touchPanel:px-6 touchPanel:py-4 border-b flex-shrink-0"
            style={{ ...headerBorder, marginBottom: 0 }}
          >
            <div className="flex items-center justify-between gap-3 w-full">
              <CardTitle className="flex items-center gap-2 text-base touchPanel:text-2xl font-bold">
                <ClipboardList className="w-5 h-5 touchPanel:w-7 touchPanel:h-7 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                <span>Order Summary</span>
              </CardTitle>

              <span
                className="text-[11px] touchPanel:text-sm font-semibold px-3 py-1 touchPanel:px-4 touchPanel:py-1.5 rounded-full whitespace-nowrap"
                style={{
                  backgroundColor: totalItems > 0
                    ? 'color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))'
                    : 'var(--color-bg)',
                  color: totalItems > 0 ? 'var(--color-primary)' : 'var(--color-text-light)',
                  border: `1px solid ${totalItems > 0
                    ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)'
                    : 'var(--color-border)'}`,
                }}
              >
                {totalItems > 0 ? `Total · ${totalItems} item${totalItems > 1 ? 's' : ''}` : 'Empty'}
              </span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 min-h-0 flex flex-col gap-3 touchPanel:gap-4 px-4 py-4 touchPanel:px-6 touchPanel:py-5">
            <div
              className="flex-1 min-h-0 overflow-y-auto rounded-xl p-3 touchPanel:p-4"
              style={insetSurface}
            >
              {orderSummary.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-4">
                  <ShoppingCart
                    className="w-10 h-10 touchPanel:w-14 touchPanel:h-14"
                    style={{ color: 'var(--color-text-light)', opacity: 0.5 }}
                  />
                  <p className="text-base touchPanel:text-xl font-semibold text-heading">No items yet</p>
                  <p className="text-xs touchPanel:text-base" style={{ color: 'var(--color-text-light)' }}>
                    Tap an item on the left to start the order
                  </p>

                  {undoSnapshot && (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleUndoClear}
                      className="mt-2 flex items-center gap-2 touchPanel:px-6 touchPanel:py-4 touchPanel:text-lg"
                    >
                      <RotateCcw className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                      <span>Undo clear ({undoSecondsLeft}s)</span>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 touchPanel:space-y-3">
                  {orderSummary.map((item) => {
                    const ItemIcon = getItemIcon(item.name);
                    return (
                      <div
                        key={item.name}
                        className="p-2.5 touchPanel:p-4 rounded-xl flex items-center gap-2 touchPanel:gap-3"
                        style={{
                          backgroundColor: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <ItemIcon
                          className="w-4 h-4 touchPanel:w-6 touchPanel:h-6 flex-shrink-0"
                          style={{ color: 'var(--color-primary)' }}
                        />
                        <p className="font-semibold text-heading text-sm touchPanel:text-xl truncate flex-1 min-w-0">
                          {item.name}
                        </p>

                        <div className="flex items-center gap-1 touchPanel:gap-2 flex-shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQtyChangeInSummary(item.name, item.quantity - 1)}
                            className="px-2 py-1 touchPanel:px-4 touchPanel:py-3"
                          >
                            <Minus className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                          </Button>
                          <span className="text-sm touchPanel:text-lg font-bold text-heading w-6 touchPanel:w-9 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleQtyChangeInSummary(item.name, item.quantity + 1)}
                            className="px-2 py-1 touchPanel:px-4 touchPanel:py-3"
                          >
                            <Plus className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteFromOrder(item.name)}
                            className="px-2 py-1 touchPanel:px-4 touchPanel:py-3"
                          >
                            <Trash2 className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 flex-shrink-0">
              <Button
                variant="secondary"
                size="md"
                onClick={handleClearAll}
                disabled={orderSummary.length === 0}
                className="touchPanel:text-xl touchPanel:py-5"
              >
                Clear
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleOrderSubmit}
                disabled={orderSummary.length === 0 || isSubmitting}
                className="touchPanel:text-xl touchPanel:py-5"
              >
                {isSubmitting ? 'Sending…' : 'Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditMenuModal
        isOpen={isEditMenuOpen}
        onClose={() => setIsEditMenuOpen(false)}
        menuItems={menuItems}
        onSaveMenu={handleSaveMenu}
      />
    </div>
  );
};

export default CafePage;