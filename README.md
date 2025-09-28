# 🚀 Filethetic

**Decentralized Data Marketplace to create, verify, and trade synthetic datasets on Filecoin blockchain**

Filethetic is enables the creation, verification, and trading of synthetic datasets on the Filecoin blockchain. Built at the intersection of Web3 + AI, it provides a secure, transparent, and efficient marketplace for data scientists, researchers, and organizations to monetize and access high-quality synthetic data.

## How to Test the Project

1.  **Navigate to the MVP URL**:
    -   Go to our MVP deployment: [`https://filethetic-app.vercel.app/profile`](https://filethetic-app.vercel.app/profile)

2.  **Connect Your Wallet**:
    -   If not already connected, connect your Web3 wallet (e.g., MetaMask).

3.  **Get Test Tokens**:
    -   Go to the **Storage** section.
    -   Get **tFIL** tokens for gas fees on the Filecoin Calibration testnet from the official faucet: [`https://faucet.calibnet.chainsafe-fil.io/funds.html`](https://faucet.calibnet.chainsafe-fil.io/funds.html)
    -   Mint **USDFC** tokens for buying datasets.

4.  **Create & List a Dataset (Optional)**:
    -   If you want to create your own dataset, apply for storage in the **/profile** storage section.

5.  **Explore the Marketplace**:
    -   Go to the **/marketplace** to browse and buy existing datasets.
    -   Go to the **/generate** page to create new synthetic data.

## Contracts

### Filecoin Calibration Testnet

| Contract                | Address                                      |
| ----------------------- | -------------------------------------------- |
| `Filethetic`            | `0x3794742c86B4D659cb5971aC609bFc5504B635dC` |
| `FilethethicDatasetNFT` | `0x12671a8Cd1C9fEad0D698C27Eccda40Cc140F223` |
| `FilethethicVerifier`   | `0x7cA80353c56CeBc0BaA14e1aEbFE976edAD8185e` |

## 🌟 Key Features

### 🔐 **Secure Dataset Management**
- **Decentralized Storage**: Leverages IPFS and Filecoin for immutable, distributed data storage
- **Smart Contract Security**: Built on robust Ethereum-compatible smart contracts
- **Access Control**: Granular permissions and allowlist management
- **Cryptographic Verification**: End-to-end data integrity verification

### 💰 **Marketplace & Trading**
- **Dataset Monetization**: Creators can set prices and earn from their synthetic datasets
- **Secure Payments**: USDFC token-based transactions with protocol fees
- **Purchase & Access**: Seamless dataset purchasing with instant access grants
- **Revenue Sharing**: Transparent fee distribution between creators and protocol

### 🤖 **AI-Powered Synthetic Data**
- **Verifiable LLMs**: Integration with verified Large Language Models
- **Quality Metrics**: Comprehensive data quality assessment and reporting
- **Multiple Formats**: Support for various data types and structures
- **Scalable Generation**: Efficient compute unit management for large datasets

### 📊 **Advanced Analytics**
- **Marketplace Insights**: Real-time analytics and market trends
- **Dataset Statistics**: Detailed metrics on usage, downloads, and performance
- **User Dashboard**: Comprehensive management interface for creators and buyers
- **Activity Tracking**: Complete audit trail of all platform interactions

## 🏗️ Architecture

### Smart Contracts
- **Filethetic.sol**: Main marketplace contract handling dataset creation, trading, and access control
- **FilethethicDatasetNFT.sol**: NFT representation of dataset ownership and access rights
- **FilethethicVerifier.sol**: Cryptographic verification system for dataset authenticity
- **MockUSDC.sol**: Test token contract for development and testing

### Frontend Application
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Type-safe development environment
- **Wagmi & RainbowKit**: Web3 wallet integration and blockchain interactions
- **Tailwind CSS & Shadcn/UI**: Beautiful, responsive user interface
- **Advanced Analytics**: Real-time data visualization and insights

### Storage & Infrastructure
- **IPFS**: Decentralized file storage for dataset content
- **Filecoin**: Long-term data persistence and retrieval
- **FilCDN**: Content delivery network for optimized data access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Git
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/filethetic-project.git
   cd filethetic-project
   ```

2. **Install dependencies**
   ```bash
   # Install contract dependencies
   cd contracts
   npm install
   
   # Install frontend dependencies
   cd ../app
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Configure your environment variables
   # Add your RPC URLs, contract addresses, and API keys
   ```

4. **Deploy Smart Contracts** (Optional - for development)
   ```bash
   cd contracts
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network localhost
   ```

5. **Start the Development Server**
   ```bash
   cd app
   npm run dev
   ```

6. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage Guide

### For Dataset Creators

1. **Connect Your Wallet**
   - Use MetaMask or any compatible Web3 wallet
   - Ensure you have sufficient USDFC tokens for transactions

2. **Create a Dataset**
   - Navigate to the "Create Dataset" section
   - Fill in dataset metadata (name, description, price)
   - Configure LLM parameters and compute requirements
   - Set privacy settings (public/private)

3. **Upload and Lock Dataset**
   - Upload your dataset to IPFS
   - Lock the dataset with content hash and metadata
   - Dataset becomes immutable and tradeable

4. **Manage Your Datasets**
   - View analytics and download statistics
   - Update pricing and metadata
   - Monitor revenue and transactions

### For Dataset Buyers

1. **Browse the Marketplace**
   - Explore available datasets by category, price, or quality
   - Use advanced filters and search functionality
   - Preview dataset samples and statistics

2. **Purchase Datasets**
   - Select desired datasets
   - Complete payment using USDFC tokens
   - Gain immediate access to dataset content

3. **Access Your Datasets**
   - View purchased datasets in your dashboard
   - Download data in various formats
   - Access detailed analytics and insights

## 🛠️ Development

### Project Structure
```
filethetic-project/
├── contracts/                 # Smart contracts
│   ├── src/                  # Solidity contracts
│   ├── scripts/              # Deployment scripts
│   └── artifacts/            # Compiled contracts
├── app/                      # Frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
└── README.md
```

### Available Scripts

**Frontend (app/)**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

**Smart Contracts (contracts/)**
```bash
npx hardhat compile  # Compile contracts
npx hardhat test     # Run tests
npx hardhat deploy   # Deploy contracts
```

### Environment Variables

Create `.env.local` in the app directory:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_FILETHETIC_CONTRACT=0x...
NEXT_PUBLIC_DATASET_NFT_CONTRACT=0x...
NEXT_PUBLIC_VERIFIER_CONTRACT=0x...
NEXT_PUBLIC_USDC_CONTRACT=0x...
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
```

### Frontend Tests
```bash
cd app
npm run test
```

## 🚀 Deployment

### Smart Contracts
1. Configure network settings in `hardhat.config.js`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network <network>`
3. Verify contracts on block explorer

### Frontend Application
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting platform
3. Configure environment variables in production

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Ensure code passes linting and formatting checks
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Demo**: [https://filethetic.vercel.app/](https://filethetic.vercel.app/)
- **Documentation**: [Coming Soon]
- **Discord**: [Join our community]
- **Twitter**: [@filethetic]

## 🙏 Acknowledgments

- **Filecoin Foundation** for blockchain infrastructure
- **OpenZeppelin** for secure smart contract libraries
- **Next.js Team** for the amazing React framework
- **Wagmi & RainbowKit** for Web3 integration tools

## 📞 Support

For support, questions, or feedback:
- Email: contact@filethetic.xyz
- GitHub Issues: [Create an issue](https://github.com/your-org/filethetic-project/issues)
- Discord: [Join our server]

---

**Built with ❤️ by the Filethetic Team**

Filethetic is a decentralized marketplace for synthetic datasets, built on Filecoin and Ethereum. It enables users to generate, verify, and trade AI-generated datasets with on-chain verification.

## Features

### 1. Dataset Generation
- Generate synthetic datasets using various AI models (OpenAI, Atoma, Anthropic)
- Customizable templates for different data types
- Upload to decentralized storage (IPFS via Web3.Storage and Lighthouse)

### 2. Verification System
- On-chain verification of dataset quality and authenticity
- Verification dashboard to track verification status
- Verification form for submitting datasets for verification

### 3. Dataset Visualization
- Interactive dataset preview with tabular and JSON views
- JSON schema validation for structured data
- Download and exploration capabilities

### 4. User Experience
- User profiles with dataset management
- Marketplace analytics dashboard
- Dark/light mode support
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Blockchain**: Ethereum, Filecoin, Hardhat
- **Wallet Integration**: RainbowKit, wagmi
- **Storage**: IPFS (Web3.Storage, Lighthouse)
- **AI Models**: OpenAI, Atoma, Anthropic
- **Data Visualization**: Recharts, JSON viewers
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask or another Ethereum wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/filethetic.git
cd filethetic
```

2. Install dependencies:
```bash
# Install app dependencies
cd app
npm install

# Install contract dependencies
cd ../contracts
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the `app` directory with the following variables:
```
# Web3 Storage
NEXT_PUBLIC_WEB3_STORAGE_API_KEY=your_web3_storage_api_key

# Lighthouse Storage
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key

# AI Model Providers
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_ATOMA_API_KEY=your_atoma_api_key
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key

# Contract Addresses
NEXT_PUBLIC_DATASET_NFT_ADDRESS=your_deployed_nft_contract_address
NEXT_PUBLIC_VERIFIER_ADDRESS=your_deployed_verifier_contract_address
```

4. Deploy contracts (if needed):
```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

5. Run the development server:
```bash
cd ../app
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
filethetic/
├── app/                   # Next.js frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── app/           # Next.js app router pages
│       ├── components/    # React components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility functions and types
│       └── styles/        # Global styles
├── contracts/             # Solidity smart contracts
│   ├── src/               # Contract source files
│   └── scripts/           # Deployment scripts
└── README.md              # Project documentation
```

## Key Components

### Smart Contracts
- `FilethethicDatasetNFT.sol`: ERC721 contract for dataset NFTs
- `FilethethicVerifier.sol`: Contract for dataset verification

### Frontend Pages
- `/`: Landing page
- `/datasets`: Dataset marketplace
- `/generate`: Dataset generation workflow
- `/verify`: Dataset verification
- `/verify/dashboard`: Verification dashboard
- `/profile`: User profile and datasets
- `/analytics`: Marketplace analytics

## License

This project is licensed under the MIT License - see the LICENSE file for details.
