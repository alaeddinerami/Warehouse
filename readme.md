# Warehouse Management App

A modern mobile application built with React Native and Expo for efficient warehouse inventory management.

## Overview

This mobile application modernizes warehouse inventory management with an intuitive interface that enables:
- Inventory management through barcode scanning and manual entry
- Real-time product tracking
- Streamlined product addition with interactive forms
- Management across multiple warehouses

## Key Features

### Authentication
Secure system access through personal secret codes

### Product Management
- Integrated barcode scanning capabilities
- Manual barcode entry option
- Stock quantity adjustments
- Comprehensive product information display
- New product creation system

### Product Listing
- Detailed product information views
- Stock level indicators
- Modification history tracking
- Stock management operations (restocking/removal)

### Advanced Capabilities
- Search and filtering functionality
- Dynamic sorting options
- PDF report generation

### Statistics Dashboard
- Product inventory totals
- Out-of-stock item tracking
- Total inventory value calculation
- Popular product movement tracking

## Setup Instructions

### System Requirements
- Node.js 
- npm 
- Expo CLI
- json-server (db.json)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/alaeddinerami/Warehouse.git
cd Warehouse
```

2. Install dependencies:
```bash
npm install
```

3. Launch development server:
```bash
npm start
```

4. Use the Expo Go app to scan the QR code on your mobile device

## API Reference

### Product Endpoints
```
GET    /products
POST   /products
PUT    /products/:id
```

### Warehouse Manager Endpoints
```
GET    /warehousemans
```

### Statistics Endpoints
```
GET    /statistics
PUT    /statistics
```