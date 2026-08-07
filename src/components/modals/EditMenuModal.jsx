import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import OnScreenKeyboard from '../ui/OnScreenKeyboard';

const MAX_MENU_ITEMS = 20;
const MAX_ITEM_NAME_LENGTH = 30;

const EditMenuModal = ({ isOpen, onClose, menuItems, onSaveMenu }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [, setIsAdding] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [localMenu, setLocalMenu] = useState([...menuItems]);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('edit');

  // Panel-safe replacement for window.confirm()
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);

  useEffect(() => {
    if (isOpen) setLocalMenu([...menuItems]);
  }, [isOpen, menuItems]);

  // Case-insensitive duplicate guard. `ignoreIndex` lets an item keep its own name.
  const isDuplicateName = (name, ignoreIndex = -1) =>
    localMenu.some(
      (item, idx) => idx !== ignoreIndex && item.trim().toLowerCase() === name.toLowerCase()
    );

  const validateName = (rawValue, ignoreIndex = -1) => {
    const value = rawValue.trim();
    if (value === '') {
      window.showToast?.('Item name cannot be empty', 'error');
      return null;
    }
    if (value.length > MAX_ITEM_NAME_LENGTH) {
      window.showToast?.(`Item name cannot exceed ${MAX_ITEM_NAME_LENGTH} characters`, 'error');
      return null;
    }
    if (isDuplicateName(value, ignoreIndex)) {
      window.showToast?.(`"${value}" is already on the menu`, 'error');
      return null;
    }
    return value;
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(localMenu[index]);
    setKeyboardMode('edit');
    setShowKeyboard(true);
    setIsAdding(false);
  };

  const handleSaveEdit = () => {
    const value = validateName(editingValue, editingIndex);
    if (value === null) return;
    const updated = [...localMenu];
    updated[editingIndex] = value;
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

  const handleDeleteClick = (index) => setPendingDeleteIndex(index);

  const handleConfirmDelete = () => {
    if (pendingDeleteIndex === null) return;
    setLocalMenu((prev) => prev.filter((_, i) => i !== pendingDeleteIndex));
    setPendingDeleteIndex(null);
  };

  const handleAddNewClick = () => {
    if (localMenu.length >= MAX_MENU_ITEMS) {
      window.showToast?.(`Maximum ${MAX_MENU_ITEMS} menu items allowed`, 'error');
      return;
    }
    setIsAdding(true);
    setNewItemValue('');
    setKeyboardMode('add');
    setShowKeyboard(true);
    setEditingIndex(null);
  };

  const handleSaveNew = () => {
    if (localMenu.length >= MAX_MENU_ITEMS) {
      window.showToast?.(`Maximum ${MAX_MENU_ITEMS} menu items allowed`, 'error');
      return;
    }
    const value = validateName(newItemValue);
    if (value === null) return;
    setLocalMenu([...localMenu, value]);
    setIsAdding(false);
    setNewItemValue('');
    setShowKeyboard(false);
  };

  const handleCancelNew = () => {
    setIsAdding(false);
    setNewItemValue('');
    setShowKeyboard(false);
  };

  const handleSaveMenu = () => {
    onSaveMenu(localMenu);
    onClose();
  };

  const handleClose = () => {
    setEditingIndex(null);
    setEditingValue('');
    setIsAdding(false);
    setNewItemValue('');
    setShowKeyboard(false);
    setPendingDeleteIndex(null);
    setLocalMenu([...menuItems]);
    onClose();
  };

  const currentInputLength = keyboardMode === 'edit' ? editingValue.length : newItemValue.length;

  const modalTitle = (
    <div className="flex items-center gap-3">
      <span>Edit Menu</span>
      {/* 2026-08-03: was bg-gray-100 + text-gray-400 — ~2.6:1 contrast, and grey-on-grey
          in every theme. Primary tint reads as a badge and stays legible on all four. */}
      <span
        className="text-sm touchPanel:text-lg px-3 py-1 rounded-full font-medium"
        style={{
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-700)',
        }}
      >
        {localMenu.length}/{MAX_MENU_ITEMS} items
      </span>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={modalTitle}
        maxWidth="max-w-5xl touchPanel:max-w-7xl"
        height="90vh"
      >
        <div className="mb-4 touchPanel:mb-6">
          {/* Recessed "well": the list sits INTO the modal surface, so the item
              rows can sit ON it. Previously the container (bg-gray-50) and the
              rows (bg-secondary) resolved to near-identical values in every
              theme — identical in dark mode — so the list read as one flat blob. */}
          <div
            className="grid grid-cols-2 gap-2 touchPanel:gap-3 max-h-[400px] touchPanel:min-h-[700px] overflow-y-auto p-3 touchPanel:p-4 rounded-lg"
            style={{
              backgroundColor: 'var(--color-bg)',
              boxShadow: 'var(--elev-pressed), var(--surface-edge)',
            }}
          >
            {localMenu.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center justify-between gap-2 p-3 touchPanel:p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  backgroundImage: 'var(--surface-glass)',
                  boxShadow: 'var(--surface-hairline), var(--surface-edge), var(--elev-rest)',
                }}
              >
                <span className="text-sm touchPanel:text-lg font-medium flex-1 truncate text-foreground">
                  {item}
                </span>
                <div className="flex gap-1 touchPanel:gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditClick(index)}
                    className="px-2 py-1 touchPanel:px-5 touchPanel:py-3"
                    aria-label={`Edit ${item}`}
                  >
                    <Edit2 className="w-3.5 h-3.5 touchPanel:w-5 touchPanel:h-5" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(index)}
                    className="px-2 py-1 touchPanel:px-5 touchPanel:py-3"
                    aria-label={`Delete ${item}`}
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
            {/* Same well treatment, with a primary ring instead of a 2px border —
                a thick border reads as a muddy band on the panel. */}
            <div
              className="rounded-lg p-3 touchPanel:p-4"
              style={{
                backgroundColor: 'var(--color-bg)',
                boxShadow: 'var(--elev-pressed), 0 0 0 2px var(--color-primary)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm touchPanel:text-lg font-semibold text-heading">
                  {keyboardMode === 'edit' ? 'Edit Item Name' : 'New Item Name'}
                </label>
                <span className={`text-xs touchPanel:text-sm font-medium ${
                  currentInputLength > MAX_ITEM_NAME_LENGTH ? 'text-danger' : 'text-muted-foreground'
                }`}>
                  {currentInputLength}/{MAX_ITEM_NAME_LENGTH}
                </span>
              </div>
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

      {/* Delete confirmation — replaces window.confirm(), which is unreliable on panels */}
      <Modal
        isOpen={pendingDeleteIndex !== null}
        onClose={() => setPendingDeleteIndex(null)}
        title="Delete Item"
        maxWidth="max-w-md touchPanel:max-w-xl"
      >
        <div className="flex items-start gap-3 touchPanel:gap-4">
          <div
            className="rounded-full p-2.5 touchPanel:p-3 flex-shrink-0"
            style={{ backgroundColor: 'var(--color-danger-surface)' }}
          >
            <AlertTriangle
              className="w-5 h-5 touchPanel:w-7 touchPanel:h-7"
              style={{ color: 'var(--color-danger-on-surface)' }}
            />
          </div>
          <p className="text-base touchPanel:text-xl text-foreground pt-1">
            Remove{' '}
            <span className="font-semibold text-heading">
              {pendingDeleteIndex !== null ? localMenu[pendingDeleteIndex] : ''}
            </span>{' '}
            from the menu?
          </p>
        </div>

        <div className="flex gap-3 mt-6 touchPanel:mt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setPendingDeleteIndex(null)}
            className="flex-1 touchPanel:text-xl touchPanel:py-5"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={handleConfirmDelete}
            className="flex-1 flex items-center justify-center gap-2 touchPanel:text-xl touchPanel:py-5"
          >
            <Trash2 className="w-5 h-5 touchPanel:w-6 touchPanel:h-6" />
            <span>Delete</span>
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default EditMenuModal;