import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import OnScreenKeyboard from '../ui/OnScreenKeyboard';

const MAX_MENU_ITEMS = 20;
const MAX_ITEM_NAME_LENGTH = 30;

const EditMenuModal = ({ isOpen, onClose, menuItems, onSaveMenu }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [localMenu, setLocalMenu] = useState([...menuItems]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('edit');

  useEffect(() => {
    if (isOpen) setLocalMenu([...menuItems]);
  }, [isOpen, menuItems]);

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(localMenu[index]);
    setKeyboardMode('edit');
    setShowKeyboard(true);
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    const trimmedValue = editingValue.trim();
    if (trimmedValue === '') { window.showToast?.('Item name cannot be empty', 'error'); return; }
    if (trimmedValue.length > MAX_ITEM_NAME_LENGTH) { window.showToast?.(`Item name cannot exceed ${MAX_ITEM_NAME_LENGTH} characters`, 'error'); return; }
    const updated = [...localMenu];
    updated[editingIndex] = trimmedValue;
    setLocalMenu(updated);
    setEditingIndex(null);
    setEditingValue('');
    setShowKeyboard(false);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
    setShowKeyboard(false);
  };

  const handleDelete = (index) => {
    if (confirm(`Delete "${localMenu[index]}"?`)) {
      setLocalMenu(localMenu.filter((_, i) => i !== index));
    }
  };

  const handleAddNewClick = () => {
    if (localMenu.length >= MAX_MENU_ITEMS) { window.showToast?.(`Maximum ${MAX_MENU_ITEMS} menu items allowed`, 'error'); return; }
    setIsAdding(true);
    setNewItemValue('');
    setKeyboardMode('add');
    setShowKeyboard(true);
    setEditingIndex(null);
  };

  const handleSaveNew = () => {
    const trimmedValue = newItemValue.trim();
    if (trimmedValue === '') { window.showToast?.('Item name cannot be empty', 'error'); return; }
    if (trimmedValue.length > MAX_ITEM_NAME_LENGTH) { window.showToast?.(`Item name cannot exceed ${MAX_ITEM_NAME_LENGTH} characters`, 'error'); return; }
    if (localMenu.length >= MAX_MENU_ITEMS) { window.showToast?.(`Maximum ${MAX_MENU_ITEMS} menu items allowed`, 'error'); return; }
    setLocalMenu([...localMenu, trimmedValue]);
    setIsAdding(false);
    setNewItemValue('');
    setShowKeyboard(false);
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewItemValue('');
    setShowKeyboard(false);
  };

  const handleSaveMenu = () => { onSaveMenu(localMenu); onClose(); };

  const handleClose = () => {
    setEditingIndex(null);
    setEditingValue('');
    setIsAdding(false);
    setNewItemValue('');
    setShowKeyboard(false);
    setLocalMenu([...menuItems]);
    onClose();
  };

  const currentInputLength = keyboardMode === 'edit' ? editingValue.length : newItemValue.length;

  // ✅ CHANGED: style={} → bg-gray-100 text-gray-400
  const modalTitle = (
    <div className="flex items-center gap-3">
      <span>Edit Menu</span>
      <span className="text-sm touchPanel:text-lg px-3 py-1 rounded-full bg-gray-100 text-gray-400">
        {localMenu.length}/{MAX_MENU_ITEMS} items
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      maxWidth="max-w-5xl touchPanel:max-w-7xl"
      height="90vh"
    >
      <div className="mb-4 touchPanel:mb-6">
        {/* ✅ CHANGED: style={} → bg-gray-50 border-border */}
        <div className="grid grid-cols-2 gap-2 touchPanel:gap-3 max-h-[400px] touchPanel:min-h-[700px] overflow-y-auto p-3 touchPanel:p-4 rounded-lg border border-border bg-gray-50">
          {localMenu.map((item, index) => (
            // ✅ CHANGED: style={} → bg-secondary border-border
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-3 touchPanel:p-4 rounded-lg shadow-sm border border-border bg-secondary"
            >
              {/* ✅ CHANGED: style={} → text-foreground */}
              <span className="text-sm touchPanel:text-lg font-medium flex-1 truncate text-foreground">
                {item}
              </span>
              <div className="flex gap-1 touchPanel:gap-2 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditClick(index)}
                  className="px-2 py-1 touchPanel:px-5 touchPanel:py-3"
                >
                  <Edit2 className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(index)}
                  className="px-2 py-1 touchPanel:px-5 touchPanel:py-3"
                >
                  <Trash2 className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={handleAddNewClick}
        disabled={localMenu.length >= MAX_MENU_ITEMS}
        className="w-full flex items-center justify-center gap-2 touchPanel:py-5 touchPanel:text-xl"
      >
        <Plus className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
        <span>Add New Item {localMenu.length >= MAX_MENU_ITEMS && '(Limit Reached)'}</span>
      </Button>

      {showKeyboard && (
        <div className="mt-4 touchPanel:mt-6 space-y-3 touchPanel:space-y-4">
          {/* ✅ CHANGED: style={} → bg-gray-50 */}
          <div className="border-2 border-primary rounded-lg p-3 touchPanel:p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm touchPanel:text-lg font-semibold text-heading">
                {keyboardMode === 'edit' ? 'Edit Item Name' : 'New Item Name'}
              </label>
              {/* ✅ CHANGED: style={} → text-gray-400, red-600 kept as semantic */}
              <span className={`text-xs touchPanel:text-sm font-medium ${
                currentInputLength > MAX_ITEM_NAME_LENGTH ? 'text-red-600' : 'text-gray-400'
              }`}>
                {currentInputLength}/{MAX_ITEM_NAME_LENGTH}
              </span>
            </div>
            {/* ✅ CHANGED: style={} → bg-secondary border-border text-foreground */}
            <div className="bg-secondary border border-border rounded-lg p-3 touchPanel:p-4 text-base touchPanel:text-xl min-h-[50px] touchPanel:min-h-[60px] break-words text-foreground">
              {keyboardMode === 'edit' ? editingValue : newItemValue}
            </div>
          </div>

          <OnScreenKeyboard
            value={keyboardMode === 'edit' ? editingValue : newItemValue}
            onChange={keyboardMode === 'edit' ? setEditingValue : setNewItemValue}
            onEnter={keyboardMode === 'edit' ? handleSaveEdit : handleSaveNew}
            onClose={keyboardMode === 'edit' ? handleCancelEdit : handleCancelNew}
          />
        </div>
      )}

      {!showKeyboard && (
        <div className="flex gap-3 mt-4 touchPanel:mt-6">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleClose}
            className="flex-1 touchPanel:text-xl touchPanel:py-5"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveMenu}
            className="flex-1 flex items-center justify-center gap-2 touchPanel:text-xl touchPanel:py-5"
          >
            <Save className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
            <span>Save Menu</span>
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default EditMenuModal;
