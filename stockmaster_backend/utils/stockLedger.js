import StockLedger from "../models/stockLedger.js";
import Product from "../models/product.js";

// Helper function to log stock movement
export const logStockMovement = async ({
  movementType,
  documentId,
  documentNumber,
  productId,
  warehouseId,
  locationId,
  quantity,
  quantityBefore = null,
  quantityAfter = null,
  sourceWarehouseId = null,
  sourceLocationId = null,
  destinationWarehouseId = null,
  destinationLocationId = null,
  reference = "",
  notes = "",
  performedBy
}) => {
  try {
    // Get current stock before movement if not provided
    let qtyBefore = quantityBefore;
    let qtyAfter = quantityAfter;
    
    if (qtyBefore === null || qtyAfter === null) {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      if (qtyBefore === null) {
        qtyBefore = product.stockByLocation.get(locationId) || 0;
      }
      
      // Calculate quantity after (this should match what updateProductStock does)
      if (qtyAfter === null) {
        if (movementType === 'delivery') {
          qtyAfter = Math.max(0, qtyBefore - quantity);
        } else if (movementType === 'transfer') {
          // For transfers, we log two entries (source and destination)
          // This is the source entry (decrease)
          qtyAfter = Math.max(0, qtyBefore - quantity);
        } else if (movementType === 'adjustment') {
          // For adjustments, get the actual quantity after update
          const productAfter = await Product.findById(productId);
          qtyAfter = productAfter.stockByLocation.get(locationId) || 0;
        } else {
          // receipt
          qtyAfter = qtyBefore + quantity;
        }
      }
    }

    await StockLedger.create({
      movementType,
      documentId,
      documentNumber,
      productId,
      warehouseId,
      locationId,
      quantity: movementType === 'delivery' || (movementType === 'transfer' && sourceLocationId) ? -Math.abs(quantity) : Math.abs(quantity),
      quantityBefore: qtyBefore,
      quantityAfter: qtyAfter,
      sourceWarehouseId,
      sourceLocationId,
      destinationWarehouseId,
      destinationLocationId,
      reference,
      notes,
      performedBy,
      movementDate: new Date()
    });

    // If it's a transfer, also log the destination entry
    if (movementType === 'transfer' && destinationWarehouseId && destinationLocationId) {
      // Get destination quantity after update
      const destProduct = await Product.findById(productId);
      const destQuantityBefore = destProduct.stockByLocation.get(destinationLocationId) || 0;
      const destQuantityAfter = destQuantityBefore + quantity;

      await StockLedger.create({
        movementType: 'transfer',
        documentId,
        documentNumber,
        productId,
        warehouseId: destinationWarehouseId,
        locationId: destinationLocationId,
        quantity: Math.abs(quantity),
        quantityBefore: destQuantityBefore,
        quantityAfter: destQuantityAfter,
        sourceWarehouseId,
        sourceLocationId,
        destinationWarehouseId,
        destinationLocationId,
        reference,
        notes,
        performedBy,
        movementDate: new Date()
      });
    }
  } catch (error) {
    console.error("Error logging stock movement:", error);
    // Don't throw - logging is not critical for the operation
  }
};

