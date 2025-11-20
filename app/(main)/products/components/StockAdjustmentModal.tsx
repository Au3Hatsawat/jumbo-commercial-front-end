'use client';

import React, { useState, useCallback} from 'react';
import { X, CheckCircle, Package, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

import { Product } from '@/libs/types/product';
import { ProductStockPayload, StockType } from '@/libs/types/stock';
import { useCreateStockLog } from '@/libs/hooks/useOrder';
import { useRestockProduct } from '@/libs/hooks/useProducts';
import { Button, Input, Select, Textarea } from '@/components/ui/Input';

// 1. Import Store
import useToastStore from '@/libs/store/alertStore';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [quantity, setQuantity] = useState(0);
  const [stockType, setStockType] = useState<StockType>(StockType.RESTOCK);
  const [costPrice, setCostPrice] = useState<string>(product.averageCost || '0.00');
  const [note, setNote] = useState('');
  const [adjustmentDirection, setAdjustmentDirection] = useState<'increase' | 'decrease'>('decrease');

  const showToast = useToastStore(state => state.showToast);

  const restockMutation = useRestockProduct();
  const createStockLogMutation = useCreateStockLog();

  const isPending = restockMutation.isPending || createStockLogMutation.isPending;

  const resetFormStates = useCallback(() => {
    setQuantity(0);
    setStockType(StockType.RESTOCK);
    setCostPrice(product.averageCost || '0.00');
    setAdjustmentDirection('decrease');
    setNote('');
  }, [product.averageCost]);

  const handleClose = useCallback(() => {
    if (!isPending) {
      onClose();
      resetFormStates();
    }
  }, [onClose, isPending, resetFormStates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      showToast("กรุณาระบุจำนวนที่มากกว่า 0", 'error');
      return;
    }

    if (stockType === StockType.RESTOCK) {
      if (!costPrice || parseFloat(costPrice) <= 0) {
        showToast("กรุณาระบุต้นทุนต่อหน่วยใหม่สำหรับรายการรับเข้า", 'error');
        return;
      }

      const restockPayload = {
        productId: product.id,
        quantityToAdd: quantity,
        costPerUnit: Number(costPrice),
        note: note || undefined,
      };

      restockMutation.mutate(restockPayload, {
        onSuccess: () => {
          showToast('รับสินค้าเข้าสำเร็จ! (ต้นทุนเฉลี่ยถูกคำนวณใหม่)', 'success');
          handleClose(); 
        },
        onError: (err: Error) => showToast(`รับสินค้าเข้าล้มเหลว: ${err.message}`, 'error'),
      });

    } else {
      let actualQuantity = quantity;

      if (stockType === StockType.ADJUSTMENT && adjustmentDirection === 'decrease') {
        actualQuantity = -quantity;
      } else if (stockType === StockType.DAMAGED) {
        actualQuantity = -quantity;
      }

      const stockLogPayload: ProductStockPayload = {
        productId: product.id,
        quantity: actualQuantity,
        stockType: StockType.ADJUSTMENT,
        note: note || undefined,
      };

      createStockLogMutation.mutate(stockLogPayload, {
        onSuccess: () => {
          showToast(`ปรับปรุงสต็อกสำเร็จ! (${stockType})`, 'success');
          handleClose(); 
        },
        onError: (err: Error) => showToast(`ปรับปรุงสต็อกล้มเหลว: ${err.message}`, 'error'),
      });
    }
  };

  if (!isOpen) return null;

  const unitName = product.unit?.nameTh || 'หน่วย';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-linear-to-r from-emerald-50 to-teal-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-emerald-600" />
              ปรับปรุงสต็อก
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">{product.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isPending}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Stock Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">สต็อกปัจจุบัน</span>
              <span className="text-2xl font-bold text-emerald-600">
                {product.currentStock} {unitName}
              </span>
            </div>
            {(product.averageCost && product.averageCost !== '0.00') && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">ต้นทุนเฉลี่ย</span>
                <span className="text-sm font-semibold text-gray-700">
                  ฿{parseFloat(product.averageCost).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Stock Type Selection */}
            <Select
              label="ประเภทรายการ"
              value={stockType}
              onChange={(e) => setStockType(e.target.value as StockType)}
              required
            >
              <option value={StockType.RESTOCK}>
                รับสินค้าเข้า (RESTOCK) - เพิ่มสต็อก + อัพเดทต้นทุนเฉลี่ย
              </option>
              <option value={StockType.ADJUSTMENT}>
                ปรับปรุงสต็อก (ADJUSTMENT) - เพิ่ม/ลดสต็อก
              </option>
              <option value={StockType.DAMAGED}>
                สินค้าเสียหาย (DAMAGED) - ลดสต็อก
              </option>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity Input */}
              <Input
                label={`จำนวน (${unitName})`}
                type="number"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="1"
                required
                placeholder="0"
              />

              {/* Conditional Second Field */}
              {stockType === StockType.RESTOCK && (
                <Input
                  label="ต้นทุนต่อหน่วยใหม่"
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder={product.averageCost}
                  required
                  helperText="กรอกต้นทุนสินค้าที่รับเข้าครั้งนี้"
                />
              )}

              {stockType === StockType.ADJUSTMENT && (
                <Select
                  label="ทิศทางการปรับปรุง"
                  value={adjustmentDirection}
                  onChange={(e) => setAdjustmentDirection(e.target.value as 'increase' | 'decrease')}
                >
                  <option value="increase">
                    เพิ่มสต็อก (+)
                  </option>
                  <option value="decrease">
                    ลดสต็อก (-)
                  </option>
                </Select>
              )}

              {stockType === StockType.DAMAGED && (
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    ผลกระทบ
                  </label>
                  <div className="px-3.5 py-2 text-sm rounded-lg border border-gray-200 bg-red-50 text-red-700 font-medium flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    ลดสต็อก {quantity} {unitName}
                  </div>
                </div>
              )}
            </div>

            {/* Preview of Change */}
            {quantity > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">สต็อกหลังปรับปรุง</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{product.currentStock}</span>
                    {stockType === StockType.RESTOCK || (stockType === StockType.ADJUSTMENT && adjustmentDirection === 'increase') ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">+{quantity}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-semibold">-{quantity}</span>
                      </>
                    )}
                    <span className="text-gray-400">→</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {stockType === StockType.RESTOCK || (stockType === StockType.ADJUSTMENT && adjustmentDirection === 'increase')
                        ? product.currentStock + quantity
                        : product.currentStock - quantity
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Note */}
            <Textarea
              label="หมายเหตุ"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุสาเหตุการปรับสต็อก เช่น นับสต็อกผิด, สินค้าเสียหาย, หมดอายุ..."
              helperText="หมายเหตุจะช่วยในการตรวจสอบย้อนหลัง"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              type="button"
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending || quantity <= 0}
              className="min-w-[140px]"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  บันทึกการปรับปรุง
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};