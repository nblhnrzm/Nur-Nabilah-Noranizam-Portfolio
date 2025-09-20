# SmartStock Database Schema Design

## Overview

The SmartStock database schema is designed to support a responsive, offline-first inventory management system as specified in the product requirements document. The schema uses IndexedDB for local storage with Dexie.js as the database wrapper.

## Core Tables

The database consists of five core tables that form the foundation of the inventory management system:

1. **Products Table**: Stores product information including name, SKU, description, category, tags, attributes, images, and barcode.
2. **Inventory Table**: Tracks current inventory status for each product, including quantity, location, minimum quantity thresholds, cost price, and selling price.
3. **Inventory Transaction Table**: Records all inventory operations (stock-in, stock-out, adjustments) with before and after quantities for audit purposes.
4. **Category Table**: Organizes products into categories with support for hierarchical structures.
5. **Settings Table**: Stores application settings and preferences.

## Future Expansion Tables

The schema includes definitions for future expansion tables that will be implemented in later versions:

1. **Users Table**: For multi-user support with roles and permissions.
2. **Suppliers Table**: For supplier management.
3. **Orders Table**: For simple order management.
4. **Order Items Table**: For tracking individual items within orders.
5. **Inventory Report Table**: For storing generated reports.
6. **Barcode Table**: For barcode generation and management.

## Key Features

- **Offline-First**: All data is stored locally in IndexedDB, allowing the application to function without an internet connection.
- **Relational Structure**: Tables are linked through foreign keys to maintain data integrity.
- **Optimized Indexing**: Fields commonly used in filters and searches are indexed for performance.
- **Versioned Schema**: The database uses versioning to manage schema changes and ensure backward compatibility.
- **Utility Methods**: The database class provides utility methods for common operations like getting low stock items, calculating inventory value, and backup/restore functionality.

## Implementation Details

- The schema is implemented using Dexie.js, a wrapper for IndexedDB that provides a more developer-friendly API.
- Primary keys are auto-incremented and indexed for fast lookups.
- Foreign keys are indexed to optimize join operations.
- Multi-entry indexing is used for array fields like tags.
- The database includes methods for initializing default data, which is useful for first-time users.

## Data Flow

1. **Product Creation**: Products are created and assigned to categories.
2. **Inventory Management**: Inventory records are created for products, tracking quantity and location.
3. **Inventory Operations**: Stock-in, stock-out, and adjustment operations are recorded as transactions, updating the inventory quantities.
4. **Reporting**: Data from products, inventory, and transactions can be queried to generate reports.

## Future Enhancements

The schema is designed to be extensible, with planned future enhancements including:

1. **Multi-User Support**: Adding user accounts, roles, and permissions.
2. **Supplier Management**: Tracking suppliers and their products.
3. **Order Management**: Creating and tracking purchase orders.
4. **Advanced Reporting**: Generating and storing complex reports.
5. **Barcode Integration**: Enhanced barcode generation and scanning capabilities.

## Conclusion

The SmartStock database schema provides a solid foundation for the inventory management system, with a focus on offline functionality, performance, and future extensibility. The design aligns with the product requirements and supports all the core features needed for effective inventory management.
