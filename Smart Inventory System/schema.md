# SmartStock Database Schema Documentation

This document outlines the proposed IndexedDB schema for the SmartStock application, inspired by common WMS patterns found in systems like GreaterWMS, but adapted for a local-first IndexedDB environment using Dexie.js.

## Schema Diagram

```mermaid
erDiagram
    PRODUCT {
        string id PK "UUID"
        string name
        string sku "Unique SKU"
        string description
        string category_id FK "Optional FK to CATEGORY"
        string default_supplier_id FK "Optional FK to SUPPLIER"
        array tags "Searchable tags"
        object attributes "Custom key-value pairs"
        object dimensions "Optional: {w, d, h}"
        number weight "Optional: Weight per unit"
        string weight_unit "Optional: e.g., kg, lb"
        array images "URLs or paths"
        string barcode "Primary barcode"
        date created_at
        date updated_at
    }

    INVENTORY {
        string id PK "UUID, represents a stock item batch/instance"
        string product_id FK "FK to PRODUCT"
        number quantity "Current quantity in this location/batch"
        string unit "Unit of measure (e.g., pcs, kg)"
        string location "Storage location identifier (bin, shelf)"
        string status "Stock status: available, quality_check, on_hold, damaged"
        number min_quantity "Optional: Minimum stock level for this item/location"
        number cost_price "Optional: Cost price for this batch"
        number selling_price "Optional: Selling price"
        string batch "Optional: Batch or Lot number"
        date expiry_date "Optional: Expiry date"
        date updated_at "Last update timestamp for this record"
    }

    INVENTORY_TRANSACTION {
        string id PK "UUID"
        string product_id FK "FK to PRODUCT"
        string type "receipt, shipment, adjustment, transfer, cycle_count, initial"
        number quantity "Quantity changed (+/-)"
        number before_quantity "Quantity before transaction"
        number after_quantity "Quantity after transaction"
        string unit
        string location_from "Optional: Source location for transfers"
        string location_to "Optional: Destination location for transfers/receipts"
        string order_id "Optional: FK to PURCHASE_ORDER or SALES_ORDER"
        string order_item_id "Optional: FK to specific order item"
        date date "Timestamp of the transaction"
        string notes "Optional notes"
        string reference "Optional external reference (e.g., document number)"
        string operator "User or system process performing the action"
    }

    CATEGORY {
        string id PK "UUID"
        string name
        string parent_id FK "Optional FK to CATEGORY (for subcategories)"
        string description
        string icon "Optional icon identifier"
        date created_at
        date updated_at
    }

    SUPPLIER {
        string id PK "UUID"
        string name
        string contact_person
        string email
        string phone
        string address
        string notes
        date created_at
        date updated_at
    }

    CUSTOMER {
        string id PK "UUID"
        string name
        string contact_person
        string email
        string phone
        string address
        string notes
        date created_at
        date updated_at
    }

    PURCHASE_ORDER {
        string id PK "UUID"
        string reference "PO Number/Reference"
        date date "Order date"
        string status "pending, partially_received, received, cancelled"
        string supplier_id FK "FK to SUPPLIER"
        string notes
        date created_at
        date updated_at
    }

    PURCHASE_ORDER_ITEM {
        string id PK "UUID"
        string order_id FK "FK to PURCHASE_ORDER"
        string product_id FK "FK to PRODUCT"
        number requested_qty "Quantity ordered"
        number received_qty "Quantity actually received"
        string unit
        number unit_price "Cost price per unit"
    }

    SALES_ORDER {
        string id PK "UUID"
        string reference "SO Number/Reference"
        date date "Order date"
        string status "pending, picking, partially_shipped, shipped, delivered, cancelled"
        string customer_id FK "FK to CUSTOMER"
        string notes
        date created_at
        date updated_at
    }

    SALES_ORDER_ITEM {
        string id PK "UUID"
        string order_id FK "FK to SALES_ORDER"
        string product_id FK "FK to PRODUCT"
        number requested_qty "Quantity ordered"
        number picked_qty "Quantity picked for shipment"
        number shipped_qty "Quantity actually shipped"
        string unit
        number unit_price "Selling price per unit"
    }

    SETTINGS {
        string id PK "Setting key name"
        any value "Setting value"
        date updated_at
    }

    USER {
        string id PK "UUID or username"
        string username
        string email
        string display_name
        string password_hash "If storing locally (use securely)"
        string role
        object preferences
        date created_at
        date updated_at
        date last_login
    }

    BARCODE {
        string id PK "UUID"
        string product_id FK "FK to PRODUCT"
        string barcode_type "EAN, UPC, QR, etc."
        string barcode_value "The actual barcode data"
        string label_template "Optional: Associated label format"
        date created_at
    }

    PRODUCT               ||--o{ INVENTORY             : "has stock at"
    PRODUCT               ||--o{ INVENTORY_TRANSACTION : "has history"
    PRODUCT               ||--o{ PURCHASE_ORDER_ITEM : "can be in"
    PRODUCT               ||--o{ SALES_ORDER_ITEM    : "can be in"
    PRODUCT               ||--o{ BARCODE             : "can have"
    CATEGORY              ||--o{ PRODUCT             : "groups"
    CATEGORY              ||--o{ CATEGORY            : "parent of"
    SUPPLIER              ||--o{ PRODUCT             : "supplies (default)"
    SUPPLIER              ||--o{ PURCHASE_ORDER      : "receives"
    CUSTOMER              ||--o{ SALES_ORDER         : "places"
    PURCHASE_ORDER        ||--o{ PURCHASE_ORDER_ITEM : "contains"
    SALES_ORDER           ||--o{ SALES_ORDER_ITEM    : "contains"
    PURCHASE_ORDER        {-- INVENTORY_TRANSACTION : "triggers (receipt)"
    SALES_ORDER           {-- INVENTORY_TRANSACTION : "triggers (shipment)"
    PURCHASE_ORDER_ITEM   {-- INVENTORY_TRANSACTION : "references"
    SALES_ORDER_ITEM      {-- INVENTORY_TRANSACTION : "references"

```

## Table Descriptions and Logic Enhancements

1.  **PRODUCT:**
    *   Added optional `dimensions`, `weight`, `weight_unit` based on `goods` table for better physical tracking.
    *   Added `default_supplier_id` for easier PO creation.

2.  **INVENTORY:**
    *   Represents stock of a specific product at a specific location, potentially tied to a batch/expiry. This is closer to `stockbin`.
    *   Added `status` field inspired by `stocklist` statuses (simplified for local DB: 'available', 'quality_check', 'on_hold', 'damaged'). This helps track non-available stock directly.
    *   `id` now represents a unique stock record (e.g., Product A, Batch 123, Location X). Multiple records can exist for the same `product_id` if stock is in different locations or batches.

3.  **INVENTORY_TRANSACTION:**
    *   Acts like `qtyrecorder` but more structured.
    *   Enhanced `type` field for clarity (receipt, shipment, adjustment, transfer, cycle_count, initial).
    *   Added `location_from` and `location_to` to support stock transfers between locations.
    *   Added `order_id` and `order_item_id` to link transactions back to specific POs or SOs, improving traceability (similar to how ASN/DN link to inventory changes).

4.  **ORDER / ORDER_ITEM (Split):**
    *   Split the generic `ORDER` into `PURCHASE_ORDER` (incoming/ASN equivalent) and `SALES_ORDER` (outgoing/DN equivalent). This clarifies the workflow.
    *   **PURCHASE_ORDER / PURCHASE_ORDER_ITEM:**
        *   Tracks orders from Suppliers.
        *   `status` reflects receiving stages ('pending', 'partially_received', 'received', 'cancelled').
        *   `PURCHASE_ORDER_ITEM` includes `requested_qty` vs `received_qty` to track discrepancies (like `asndetail`).
    *   **SALES_ORDER / SALES_ORDER_ITEM:**
        *   Tracks orders to Customers.
        *   `status` reflects picking/shipping stages ('pending', 'picking', 'partially_shipped', 'shipped', 'delivered', 'cancelled').
        *   `SALES_ORDER_ITEM` includes `requested_qty`, `picked_qty`, and `shipped_qty` to track fulfillment progress (like `dndetail` and `pickinglist`).

5.  **CUSTOMER:**
    *   Added a dedicated `CUSTOMER` table, mirroring the `SUPPLIER` table, essential for managing sales orders.

6.  **Relationships:**
    *   Updated the Mermaid diagram to reflect the new tables and relationships, including links between orders and transactions.

This revised schema provides a more robust foundation for inventory management, incorporating key concepts like distinct purchase/sales flows, stock statuses, and transaction traceability, inspired by the structure of GreaterWMS but tailored for IndexedDB.
