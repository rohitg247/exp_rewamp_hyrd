import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Package } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { safeLocalStorage } from '../../utils/safeStorage';
import { useSerialJoin } from '../../hooks/useJoin';
import { SERIAL_JOINS } from '../../crestron/joins';

const OrderListModal = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);

  const [, setOrderStatus] = useSerialJoin(SERIAL_JOINS.CAFE_ORDER_STATUS, '');

  useEffect(() => {
    if (isOpen) loadOrders();
  }, [isOpen]);

  const loadOrders = () => {
    try {
      const saved = safeLocalStorage.getItem('cafe_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const pendingOrders = Array.isArray(parsed)
          ? parsed.filter(order => order.status === 'pending')
          : [];
        setOrders(pendingOrders);
        console.log('📥 Loaded orders:', pendingOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      setOrders([]);
    }
  };

  const removeOrder = (orderId) => {
    try {
      const saved = safeLocalStorage.getItem('cafe_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.filter(order => order.id !== orderId);
        safeLocalStorage.setItem('cafe_orders', JSON.stringify(updated));
        setOrders(updated.filter(order => order.status === 'pending'));
        console.log('💾 Order removed:', orderId);
      }
    } catch (error) {
      console.error('❌ Failed to remove order:', error);
    }
  };

  // const handleComplete = (order) => {
  //   console.log('✅ Completing order:', order.id);
  //   sendCompleteDigital(true);
  //   setTimeout(() => sendCompleteDigital(false), 100);
  //   removeOrder(order.id);
  //   window.showToast?.(`✅ Order #${order.id} completed successfully!`, 'success', 3000);
  // };

  // const handleCancel = (order) => {
  //   console.log('❌ Cancelling order:', order.id);
  //   sendCancelDigital(true);
  //   setTimeout(() => sendCancelDigital(false), 100);
  //   removeOrder(order.id);
  //   window.showToast?.(`❌ Order #${order.id} cancelled`, 'error', 3000);
  // };

  const handleComplete = (order) => {
    console.log('✅ Completing order:', order.id);
    setOrderStatus(`${order.id}:1`);
    removeOrder(order.id);
    window.showToast?.(`✅ Order #${order.id} completed successfully!`, 'success', 3000);
  };

  const handleCancel = (order) => {
    console.log('❌ Cancelling order:', order.id);
    setOrderStatus(`${order.id}:0`);
    removeOrder(order.id);
    window.showToast?.(`❌ Order #${order.id} cancelled`, 'error', 3000);
  };


  const parseOrderItems = (itemsString) => {
    return itemsString.split('|').map(item => {
      const [name, quantity] = item.split(',');
      return { name, quantity: parseInt(quantity) };
    });
  };

  // ✅ CHANGED: style={} → Tailwind classes
  const modalTitle = (
    <div className="flex items-center gap-3">
      <span>Order List</span>
      <span className="text-sm touchPanel:text-lg px-3 py-1 rounded-full bg-gray-100 text-gray-400">
        {orders.length} pending
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="max-w-4xl touchPanel:max-w-6xl"
      height="80vh"
    >
      <div className="flex flex-col h-full -m-4 sm:-m-6 touchPanel:-m-8">

        {/* Orders List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 touchPanel:p-8 min-h-0">
          {orders.length === 0 ? (
            // ✅ CHANGED: style={} → text-gray-400
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              {/* ✅ CHANGED: style={} → text-gray-300 */}
              <Package className="w-16 h-16 touchPanel:w-20 touchPanel:h-20 mb-4 text-gray-300" />
              <p className="text-center text-base touchPanel:text-xl">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-3 touchPanel:space-y-4">
              {orders.map((order) => (
                // ✅ CHANGED: style={} → bg-secondary border-border
                <div
                  key={order.id}
                  className="bg-secondary p-4 touchPanel:p-6 rounded-xl border-2 border-border shadow-sm"
                >
                  <div className="mb-3 touchPanel:mb-4">
                    <div className="grid grid-cols-1 gap-2 touchPanel:gap-3">
                      {parseOrderItems(order.items).map((item, index) => (
                        // ✅ CHANGED: style={} → bg-gray-100 (depth fix — was bg-gray-50)
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 p-2 touchPanel:p-3 rounded-lg"
                        >
                          {/* ✅ CHANGED: style={} → text-foreground */}
                          <span className="text-sm touchPanel:text-lg font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="text-sm touchPanel:text-lg font-bold text-primary">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons — unchanged */}
                  <div className="grid grid-cols-2 gap-2 touchPanel:gap-3">
                    <Button
                      variant="success"
                      size="md"
                      onClick={() => handleComplete(order)}
                      className="flex items-center justify-center gap-2 touchPanel:text-lg touchPanel:py-4"
                    >
                      <CheckCircle className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                      <span>Complete</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => handleCancel(order)}
                      className="flex items-center justify-center gap-2 touchPanel:text-lg touchPanel:py-4"
                    >
                      <XCircle className="w-4 h-4 touchPanel:w-5 touchPanel:h-5" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ CHANGED: style={} → border-border */}
        <div className="flex p-4 sm:p-6 touchPanel:p-8 border-t border-border flex-shrink-0">
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="flex-1 touchPanel:text-xl touchPanel:py-5"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderListModal;
