import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Edit } from 'lucide-react';
// import { Plus, Minus, Trash2, Edit, ClipboardList } from 'lucide-react';
import { useSerialJoin } from '../hooks/useJoin';
import { SERIAL_JOINS } from '../crestron/joins';
import { safeLocalStorage } from '../utils/safeStorage';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EditMenuModal from '../components/modals/EditMenuModal';
// import OrderListModal from '../components/modals/OrderListModal';
import orderPlacedSound from '../assets/sounds/order-placed.mp3';


const DEFAULT_MENU_ITEMS = [
  'Water', 'Cappuccino Coffee', 'Latte Coffee', 'Espresso Coffee',
  'Ginger Tea', 'Black Tea', 'Lemon Tea', 'Masala Tea', 'Green Tea'
];

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
  // const [isOrderListOpen, setIsOrderListOpen] = useState(false);

  useEffect(() => {
    safeLocalStorage.setItem('cafe_menu_items', JSON.stringify(menuItems));
    console.log('💾 Menu saved to safeLocalStorage:', menuItems);
  }, [menuItems]);

  const [, setCafeOrderListText] = useSerialJoin(SERIAL_JOINS.CAFE_ORDER_LIST, '');

  const [selectedItem, setSelectedItem] = useState(menuItems[0]);
  const [quantity, setQuantity] = useState(1);
  const [orderSummary, setOrderSummary] = useState([]);

  useEffect(() => {
    if (!menuItems.includes(selectedItem)) {
      setSelectedItem(menuItems[0] || '');
    }
  }, [menuItems, selectedItem]);

  const handleSaveMenu = (newMenu) => {
    setMenuItems(newMenu);
    window.showToast?.('✅ Menu saved successfully', 'success');
    console.log('✅ Menu updated:', newMenu);
  };

  const handleAddToOrder = () => {
    const existingItem = orderSummary.find(item => item.name === selectedItem);
    let updatedOrder;
    if (existingItem) {
      updatedOrder = orderSummary.map(item =>
        item.name === selectedItem
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedOrder = [...orderSummary, { name: selectedItem, quantity }];
    }
    setOrderSummary(updatedOrder);
    setQuantity(1);
    console.log('✅ Item added to order:', selectedItem, 'x', quantity);
  };

  const handleDeleteFromOrder = (itemName) => {
    const updatedOrder = orderSummary.filter(item => item.name !== itemName);
    setOrderSummary(updatedOrder);
    console.log('🗑️ Item removed from order:', itemName);
  };

  const handleQtyChangeInSummary = (itemName, newQty) => {
    if (newQty < 1) return;
    const updatedOrder = orderSummary.map(item =>
      item.name === itemName ? { ...item, quantity: newQty } : item
    );
    setOrderSummary(updatedOrder);
  };

  const handleClearAll = () => {
    setOrderSummary([]);
    console.log('🧹 Order cleared');
  };

  const getNextOrderId = () => {
    try {
      const saved = safeLocalStorage.getItem('cafe_orders');
      if (saved) {
        const orders = JSON.parse(saved);
        if (Array.isArray(orders) && orders.length > 0) {
          const maxId = Math.max(...orders.map(order => order.id));
          return maxId + 1;
        }
      }
      return 1;
    } catch (error) {
      console.error('❌ Failed to get next order ID:', error);
      return 1;
    }
  };

  // const handleOrderSubmit = () => {
  //   if (orderSummary.length === 0) {
  //     window.showToast?.('Please add items to your order', 'error');
  //     return;
  //   }
  //   const orderString = orderSummary.map(item => `${item.name},${item.quantity}`).join('|');
  //   const orderId = getNextOrderId();
  //   const newOrder = { id: orderId, items: orderString, status: 'pending' };
  //   try {
  //     const saved = safeLocalStorage.getItem('cafe_orders');
  //     const orders = saved ? JSON.parse(saved) : [];
  //     orders.push(newOrder);
  //     safeLocalStorage.setItem('cafe_orders', JSON.stringify(orders));
  //     console.log('💾 Order saved to storage:', newOrder);
  //   } catch (error) {
  //     console.error('❌ Failed to save order:', error);
  //   }
  //   setCafeOrderListText(orderString);
  //   console.log('📤 Order submitted to backend:', orderString);
  //   setOrderSummary([]);
  //   window.showToast?.(`✅ Order #${orderId} submitted successfully!`, 'success', 2000);
  // };

  const handleOrderSubmit = () => {
      if (orderSummary.length === 0) {
        window.showToast?.('Please add items to your order', 'error');
        return;
      }
      const orderId = getNextOrderId();
      const itemsString = orderSummary.map(item => `${item.name},${item.quantity}`).join('|');
      const orderString = itemsString;
      // const orderString = `id:${orderId}|${itemsString}`;
      const newOrder = { id: orderId, items: itemsString, status: 'pending' };
      try {
        const saved = safeLocalStorage.getItem('cafe_orders');
        const orders = saved ? JSON.parse(saved) : [];
        orders.push(newOrder);
        safeLocalStorage.setItem('cafe_orders', JSON.stringify(orders));
        console.log('💾 Order saved to storage:', newOrder);
      } catch (error) {
        console.error('❌ Failed to save order:', error);
      }
      setCafeOrderListText(orderString);
      console.log('📤 Order submitted to backend:', orderString);
      const audio = new Audio(orderPlacedSound);
      audio.volume = 0.7;
      audio.play().catch(e => console.warn('🔇 Order placed sound failed:', e));
      setOrderSummary([]);
      window.showToast?.(`✅ Order submitted successfully!`, 'success', 10000);
      // window.showToast?.(`✅ Order #${orderId} submitted successfully!`, 'success', 2000);
    };

  const handleIncrementQty = () => setQuantity(q => q + 1);
  const handleDecrementQty = () => { if (quantity > 1) setQuantity(q => q - 1); };
  const handleItemSelect = (item) => { setSelectedItem(item); setQuantity(1); };

  return (
    <div className="h-[calc(100vh-72px)] touchPanel:h-[calc(100vh-110px)] w-full bg-theme-bg flex overflow-hidden">
      <div className={`flex-1 p-6 touchPanel:p-8 flex h-full items-stretch gap-6 touchPanel:gap-8 overflow-hidden ${
        sidebarEnabled ? 'mr-36 touchPanel:mr-44' : 'mr-0'
      }`}>

        {/* LEFT SECTION - Item Selection */}
        <Card variant="glass" className="flex-[1] overflow-hidden flex flex-col h-full">
          <div className="p-4 touchPanel:p-6 space-y-4 touchPanel:space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl touchPanel:text-3xl font-bold text-heading">Select Item</h2>
              <div className="flex gap-2 touchPanel:gap-3">
                {/* <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOrderListOpen(true)}
                  className="flex items-center gap-2 touchPanel:px-5 touchPanel:py-4"
                >
                  <ClipboardList className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                  <span className="text-sm touchPanel:text-base">Order List</span>
                </Button> */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditMenuOpen(true)}
                  className="flex items-center gap-2 touchPanel:px-5 touchPanel:py-4"
                >
                  <Edit className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                  <span className="text-sm touchPanel:text-base">Edit Menu</span>
                </Button>
              </div>
            </div>

            {/* Scrollable Menu Grid */}
            <div className="space-y-2 touchPanel:space-y-3 flex-1 min-h-0 flex flex-col">
              <div className="border-2 border-gray-200 rounded-lg p-3 touchPanel:p-5 overflow-y-auto bg-gray-50 flex-1">
                {/* <div className="grid grid-cols-2 gap-2 touchPanel:gap-3">
                  {menuItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleItemSelect(item)}
                      className={`p-3 touchPanel:p-5 rounded-lg font-medium text-sm touchPanel:text-lg transition-all border-2 flex-shrink-0 ${
                        selectedItem === item
                          ? 'bg-primary text-white border-primary'
                          // ✅ CHANGED: bg-white → bg-gray-100
                          : 'bg-gray-100 text-heading border-gray-200 hover:border-primary'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div> */}
                <div className="grid grid-cols-2 gap-3 touchPanel:gap-4">
                  {menuItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleItemSelect(item)}
                      className={`p-5 touchPanel:p-8 rounded-xl font-semibold text-base touchPanel:text-xl transition-all border-2 flex-shrink-0 min-h-[68px] touchPanel:min-h-[100px] ${
                        selectedItem === item
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-gray-100 text-heading border-gray-200 hover:border-primary hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add Button */}
            <div className="space-y-2 touchPanel:space-y-3 flex-shrink-0">
              <label className="text-sm touchPanel:text-lg font-semibold text-heading">Quantity</label>
              <div className="grid grid-cols-2 gap-2 touchPanel:gap-3">
                <div className="flex items-center justify-start space-x-2 touchPanel:space-x-3">
                  <Button variant="secondary" size="md" onClick={handleDecrementQty} className="px-3 touchPanel:px-5 touchPanel:py-4">
                    <Minus className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
                  </Button>
                  <div className="text-lg touchPanel:text-2xl font-bold text-heading w-8 touchPanel:w-12 text-center">
                    {quantity}
                  </div>
                  <Button variant="secondary" size="md" onClick={handleIncrementQty} className="px-3 touchPanel:px-5 touchPanel:py-4">
                    <Plus className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
                  </Button>
                </div>
                <Button variant="primary" size="lg" onClick={handleAddToOrder} className="h-full touchPanel:text-xl">
                  Add to Order
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* RIGHT SECTION - Order Summary */}
        <Card variant="glass" className="flex-[1] overflow-hidden flex flex-col h-full">
          <div className="p-4 touchPanel:p-6 space-y-4 touchPanel:space-y-6 h-full flex flex-col">
            <h2 className="text-xl touchPanel:text-3xl font-bold text-heading flex-shrink-0">Order Summary</h2>

            <div className="border-2 border-gray-200 rounded-lg p-3 touchPanel:p-5 overflow-y-auto bg-gray-50 flex-1 min-h-0">
              {orderSummary.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-center text-base touchPanel:text-xl">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-2 touchPanel:space-y-3">
                  {orderSummary.map((item, index) => (
                    // ✅ CHANGED: bg-white → bg-gray-100
                    <div
                      key={index}
                      className="bg-gray-100 p-2 touchPanel:p-5 rounded-lg border border-gray-200 flex items-center justify-between gap-2 touchPanel:gap-3"
                    >
                      <p className="font-semibold text-heading text-sm touchPanel:text-xl flex-shrink-0 min-w-[80px] touchPanel:min-w-[120px]">
                        {item.name}
                      </p>
                      <div className="flex items-center justify-center space-x-1 touchPanel:space-x-2 flex-shrink-0 ml-auto">
                        <Button variant="secondary" size="sm" onClick={() => handleQtyChangeInSummary(item.name, item.quantity - 1)} className="px-2 py-1 touchPanel:px-5 touchPanel:py-3">
                          <Minus className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                        </Button>
                        <span className="text-sm touchPanel:text-lg font-bold text-heading w-6 touchPanel:w-8 text-center flex-shrink-0">
                          {item.quantity}
                        </span>
                        <Button variant="secondary" size="sm" onClick={() => handleQtyChangeInSummary(item.name, item.quantity + 1)} className="px-2 py-1 touchPanel:px-5 touchPanel:py-3">
                          <Plus className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                        </Button>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteFromOrder(item.name)} className="px-2 py-1 touchPanel:px-5 touchPanel:py-3 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {orderSummary.length > 0 && (
              <div className="text-center py-2 touchPanel:py-3 bg-primary/10 rounded-lg flex-shrink-0">
                <p className="text-sm touchPanel:text-xl text-heading font-semibold">
                  Total Items: {orderSummary.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 flex-shrink-0">
              <Button variant="secondary" size="md" onClick={handleClearAll} disabled={orderSummary.length === 0} className="touchPanel:text-xl touchPanel:py-5">
                Clear
              </Button>
              <Button variant="primary" size="md" onClick={handleOrderSubmit} disabled={orderSummary.length === 0} className="touchPanel:text-xl touchPanel:py-5">
                Order
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <EditMenuModal
        isOpen={isEditMenuOpen}
        onClose={() => setIsEditMenuOpen(false)}
        menuItems={menuItems}
        onSaveMenu={handleSaveMenu}
      />
      {/* <OrderListModal
        isOpen={isOrderListOpen}
        onClose={() => setIsOrderListOpen(false)}
      /> */}
    </div>
  );
};

export default CafePage;
