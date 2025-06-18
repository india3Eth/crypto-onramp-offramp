# Crypto On-ramp / Off-ramp Exchange

A NextJS application providing a white-labeled interface for buying and selling cryptocurrency using the Unlimit API.

![Screenshot 2025-04-11 at 9 04 47 AM](https://github.com/user-attachments/assets/acb7a91b-ffd2-4c4f-99b7-b27154c57167)


## 🚀 Features

- **User Authentication**: Email-based OTP authentication system
- **KYC Verification**: Multi-level KYC (Know Your Customer) verification
  - Level 1: Basic information
  - Level 2: ID verification + Liveness Check
  - Level 3: Proof of residence
- **Cryptocurrency Exchange**: 
  - On-ramp (Buy crypto with fiat)
  - Off-ramp (Sell crypto for fiat)
- **Transaction History**: Complete transaction management system
  - View past buy/sell transactions with detailed breakdowns
  - Copy functionality for transaction IDs and blockchain hashes
- **Real-time Quotes**: Get up-to-date exchange rates
- **Multiple Payment Methods**: Support for various fiat payment options
- **Multiple Cryptocurrencies**: Support for various crypto assets
- **Admin Dashboard**: Manage crypto assets and payment methods
- **Modern Mobile-First UI**: Responsive design optimized for mobile devices

## 📋 Requirements

- Node.js 18+
- MongoDB
- SendGrid account (for emails)
- Unlimit API credentials

## 🛠️ Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=crypto-exchange

# Auth
JWT_SECRET=your_jwt_secret_key

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email

# Unlimit API
UNLIMIT_API_KEY=your_unlimit_api_key
UNLIMIT_API_SECRET_KEY=your_unlimit_api_secret_key
UNLIMIT_API_BASE_URL=https://api-sandbox.gatefi.com

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
LOG_LEVEL=info
```

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/crypto-onramp-offramp.git
cd crypto-onramp-offramp
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Initialize the database

The application will automatically create necessary collections in MongoDB when first run.

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
.
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── (admin)/    # Admin routes
│   │   ├── (widget)/   # Main app routes
│   │   │   ├── transactions/  # Transaction history page
│   │   │   ├── profile/       # User profile
│   │   │   ├── kyc/          # KYC verification
│   │   │   └── order/        # Order management
│   │   ├── actions/    # Server actions (domain-organized)
│   │   │   ├── admin/        # Admin management actions
│   │   │   ├── auth/         # Authentication actions  
│   │   │   ├── exchange/     # Transaction & quote actions
│   │   │   ├── kyc/          # KYC verification actions
│   │   │   └── config/       # Configuration actions
│   │   ├── api/        # API routes
│   │   └── globals.css # Global styles
│   ├── components/     # React components
│   │   ├── admin/      # Admin components
│   │   ├── customer/   # Customer components
│   │   ├── exchange/   # Exchange components
│   │   ├── kyc/        # KYC components
│   │   ├── transactions/ # Transaction history components
│   │   ├── profile/    # Profile components
│   │   ├── ui/         # UI components
│   │   └── user/       # User components
│   ├── hooks/          # Custom React hooks (domain-organized)
│   │   ├── admin/      # Admin-specific hooks
│   │   ├── auth/       # Authentication hooks
│   │   ├── exchange/   # Exchange & transaction hooks
│   │   ├── profile/    # Profile management hooks
│   │   └── common/     # Common utility hooks
│   ├── lib/            # Library code
│   ├── middleware/     # Next.js middleware
│   ├── models/         # Data models
│   ├── services/       # Service layer
│   ├── types/          # TypeScript type definitions (domain-organized)
│   │   ├── admin/      # Admin types
│   │   ├── exchange/   # Exchange & transaction types
│   │   └── kyc/        # KYC types
│   └── utils/          # Utility functions (domain-organized)
│       ├── auth/       # Authentication utilities
│       ├── crypto/     # Cryptographic utilities
│       ├── config/     # Configuration utilities
│       └── common/     # Common utilities
├── .env.local          # Environment variables (create this)
├── .gitignore          # Git ignore file
├── components.json     # ShadCN UI components config
├── next.config.ts      # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 📖 API Documentation

This project's Key endpoints include:

### Authentication
- `POST /api/auth/login`: Request OTP
- `POST /api/auth/verify`: Verify OTP
- `POST /api/auth/logout`: End session

### User
- `GET /api/auth/user`: Get current user data

### KYC
- `POST /api/webhooks/kyc`: Handle KYC webhooks

### Crypto
- `GET /api/crypto/onramp`: Get cryptocurrencies for buying
- `GET /api/crypto/offramp`: Get cryptocurrencies for selling
- `GET /api/crypto/payment-methods`: Get payment methods
- `GET /api/crypto/countries`: Get supported countries

### Server Actions

**Authentication & Customer Management:**
- `createCustomer`: Create customer profile
- `submitKycLevel1`: Submit basic KYC information
- `getKycWidgetUrl`: Get URL for KYC widget

**Exchange & Transaction Management:**
- `createQuote`: Create exchange quote
- `getOnrampTransactions`: Fetch buy transaction history
- `getOfframpTransactions`: Fetch sell transaction history

**Admin Management:**
- `updateCryptoStatus`: Update crypto status (admin)
- `updatePaymentMethodStatus`: Update payment method status (admin)

### External API Integration

**Transaction History:**
- `GET /v1/external/onramp`: Retrieve onramp transaction history
- `GET /v1/external/offramp`: Retrieve offramp transaction history

## 🔍 To Complete

The project needs integration with the order creation API to finalize transactions:

1. **Order Creation Integration:**
   - Implement `POST /v1/external/offramp` endpoint for crypto-to-fiat transactions

2. **Payment Processing:**
   - Add webhook handling for payment status updates

3. **Enhanced Features:**
   - Push notifications for transaction status updates
   - Advanced filtering and search in transaction history

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Unlimit API](https://docs.gatefi.com/)
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [SendGrid](https://sendgrid.com/)
