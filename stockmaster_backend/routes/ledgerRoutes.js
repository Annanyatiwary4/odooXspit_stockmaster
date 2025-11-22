import express from "express";
import {
  getLedger,
  getLedgerByProduct,
  getLedgerByWarehouse,
} from "../controllers/ledgerController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Ledger routes
router.get("/", getLedger);
router.get("/product/:id", getLedgerByProduct);
router.get("/warehouse/:id", getLedgerByWarehouse);

export default router;

