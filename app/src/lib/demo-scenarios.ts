// Demo scenarios and presentation scripts for Filethetic platform

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  targetAudience: string[];
  keyPoints: string[];
  demoSteps: DemoStep[];
  datasets: string[];
  expectedOutcomes: string[];
}

export interface DemoStep {
  step: number;
  action: string;
  description: string;
  expectedResult: string;
  tips?: string[];
}

export interface SampleDataPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  verified: boolean;
  totalRows: number;
  format: string;
  lastUpdated: string;
  downloads: number;
  useCases: string[];
  features: string[];
  whyChoose: string;
  sampleData: Record<string, any>[];
  schema: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  qualityMetrics: {
    name: string;
    value: string;
    description: string;
  }[];
}

export const sampleDataPreviews: SampleDataPreview[] = [
  {
    id: "medical-diagnosis-ai",
    name: "Medical Diagnosis AI Dataset",
    description: "Comprehensive synthetic medical data for training diagnostic AI models",
    price: 299,
    verified: true,
    totalRows: 50000,
    format: "CSV/JSON",
    lastUpdated: "2 days ago",
    downloads: 1247,
    useCases: ["Medical AI", "Diagnostic Models", "Healthcare Analytics", "Research"],
    features: [
      "HIPAA-compliant synthetic data",
      "Diverse demographic representation",
      "Validated medical terminology",
      "Balanced diagnostic outcomes"
    ],
    whyChoose: "This dataset provides high-quality synthetic medical data that maintains statistical properties of real patient data while ensuring complete privacy compliance. Perfect for training robust diagnostic AI models without privacy concerns.",
    sampleData: [
      {
        patient_id: "P001",
        age: 45,
        gender: "Female",
        symptoms: "Chest pain, shortness of breath",
        diagnosis: "Angina",
        confidence: 0.92
      },
      {
        patient_id: "P002",
        age: 62,
        gender: "Male",
        symptoms: "Fatigue, dizziness, irregular heartbeat",
        diagnosis: "Atrial fibrillation",
        confidence: 0.88
      },
      {
        patient_id: "P003",
        age: 34,
        gender: "Female",
        symptoms: "Severe headache, nausea, light sensitivity",
        diagnosis: "Migraine",
        confidence: 0.95
      }
    ],
    schema: [
      { name: "patient_id", type: "string", description: "Unique patient identifier", required: true },
      { name: "age", type: "integer", description: "Patient age in years", required: true },
      { name: "gender", type: "string", description: "Patient gender", required: true },
      { name: "symptoms", type: "text", description: "Reported symptoms", required: true },
      { name: "diagnosis", type: "string", description: "Medical diagnosis", required: true },
      { name: "confidence", type: "float", description: "Diagnostic confidence score", required: true }
    ],
    qualityMetrics: [
      { name: "Accuracy", value: "94.2%", description: "Diagnostic accuracy" },
      { name: "Coverage", value: "98.7%", description: "Data completeness" },
      { name: "Diversity", value: "85.3%", description: "Demographic diversity" },
      { name: "Privacy", value: "100%", description: "Privacy compliance" }
    ]
  },
  {
    id: "financial-sentiment",
    name: "Financial Market Sentiment",
    description: "Real-time financial news sentiment analysis dataset",
    price: 199,
    verified: true,
    totalRows: 75000,
    format: "JSON/Parquet",
    lastUpdated: "1 hour ago",
    downloads: 892,
    useCases: ["Trading Algorithms", "Market Analysis", "Risk Assessment", "News Analytics"],
    features: [
      "Real-time market sentiment",
      "Multi-source news aggregation",
      "Sentiment scoring algorithms",
      "Historical trend analysis"
    ],
    whyChoose: "Access to high-frequency sentiment data from multiple financial news sources with advanced NLP processing. Essential for modern algorithmic trading and market analysis.",
    sampleData: [
      {
        timestamp: "2024-01-15T09:30:00Z",
        symbol: "AAPL",
        headline: "Apple reports strong quarterly earnings",
        sentiment_score: 0.82,
        source: "Reuters"
      },
      {
        timestamp: "2024-01-15T09:32:00Z",
        symbol: "TSLA",
        headline: "Tesla faces production challenges",
        sentiment_score: -0.45,
        source: "Bloomberg"
      },
      {
        timestamp: "2024-01-15T09:35:00Z",
        symbol: "MSFT",
        headline: "Microsoft announces new AI partnership",
        sentiment_score: 0.67,
        source: "CNBC"
      }
    ],
    schema: [
      { name: "timestamp", type: "datetime", description: "News publication timestamp", required: true },
      { name: "symbol", type: "string", description: "Stock ticker symbol", required: true },
      { name: "headline", type: "text", description: "News headline", required: true },
      { name: "sentiment_score", type: "float", description: "Sentiment score (-1 to 1)", required: true },
      { name: "source", type: "string", description: "News source", required: true }
    ],
    qualityMetrics: [
      { name: "Freshness", value: "< 1min", description: "Data latency" },
      { name: "Sources", value: "50+", description: "News sources" },
      { name: "Accuracy", value: "91.8%", description: "Sentiment accuracy" },
      { name: "Volume", value: "10K/day", description: "Daily updates" }
    ]
  },
  {
    id: "ecommerce-recommendations",
    name: "E-commerce Recommendations",
    description: "Customer behavior and product recommendation dataset",
    price: 149,
    verified: true,
    totalRows: 100000,
    format: "CSV/JSON",
    lastUpdated: "6 hours ago",
    downloads: 2156,
    useCases: ["Recommendation Systems", "Customer Analytics", "Personalization", "A/B Testing"],
    features: [
      "Customer journey tracking",
      "Product interaction data",
      "Purchase behavior patterns",
      "Recommendation performance metrics"
    ],
    whyChoose: "Comprehensive e-commerce dataset with rich customer behavior data, perfect for building and testing recommendation algorithms with proven performance metrics.",
    sampleData: [
      {
        user_id: "U12345",
        product_id: "P98765",
        category: "Electronics",
        action: "purchase",
        rating: 4.5,
        timestamp: "2024-01-15T14:22:00Z"
      },
      {
        user_id: "U12346",
        product_id: "P98766",
        category: "Clothing",
        action: "view",
        rating: null,
        timestamp: "2024-01-15T14:25:00Z"
      },
      {
        user_id: "U12347",
        product_id: "P98767",
        category: "Books",
        action: "add_to_cart",
        rating: null,
        timestamp: "2024-01-15T14:28:00Z"
      }
    ],
    schema: [
      { name: "user_id", type: "string", description: "Unique user identifier", required: true },
      { name: "product_id", type: "string", description: "Unique product identifier", required: true },
      { name: "category", type: "string", description: "Product category", required: true },
      { name: "action", type: "string", description: "User action type", required: true },
      { name: "rating", type: "float", description: "Product rating (1-5)", required: false },
      { name: "timestamp", type: "datetime", description: "Action timestamp", required: true }
    ],
    qualityMetrics: [
      { name: "Engagement", value: "78.4%", description: "User engagement rate" },
      { name: "Conversion", value: "12.3%", description: "Purchase conversion" },
      { name: "Retention", value: "65.7%", description: "User retention rate" },
      { name: "Diversity", value: "89.2%", description: "Product diversity" }
    ]
  }
];

export const demoScenarios: DemoScenario[] = [
  {
    id: "healthcare-ai",
    title: "AI-Powered Medical Diagnosis Assistant",
    description: "Demonstrate how synthetic medical data enables privacy-compliant AI training for healthcare applications",
    duration: "8-10 minutes",
    targetAudience: ["Healthcare professionals", "AI researchers", "Privacy advocates"],
    keyPoints: [
      "HIPAA-compliant synthetic data generation",
      "High-quality medical training datasets",
      "Blockchain verification for data integrity",
      "Decentralized marketplace for medical AI data"
    ],
    demoSteps: [
      {
        step: 1,
        action: "Navigate to marketplace",
        description: "Show the Filethetic marketplace with medical datasets",
        expectedResult: "Display of various medical datasets with verification badges",
        tips: ["Highlight the verification status", "Point out the high accuracy metrics"]
      },
      {
        step: 2,
        action: "Select medical dataset",
        description: "Click on 'Medical Diagnosis Assistant Training Data'",
        expectedResult: "Detailed view showing 15,000 synthetic patient cases with 94% accuracy",
        tips: ["Emphasize the synthetic nature", "Show the comprehensive schema"]
      },
      {
        step: 3,
        action: "Preview sample data",
        description: "Display sample medical cases and diagnoses",
        expectedResult: "Realistic patient scenarios without real patient data",
        tips: ["Explain privacy benefits", "Show data quality metrics"]
      },
      {
        step: 4,
        action: "Show verification process",
        description: "Navigate to verification dashboard",
        expectedResult: "Medical professional verification with quality scores",
        tips: ["Highlight expert validation", "Show trust indicators"]
      },
      {
        step: 5,
        action: "Demonstrate purchase flow",
        description: "Walk through dataset acquisition process",
        expectedResult: "Seamless blockchain transaction with instant access",
        tips: ["Show transparent pricing", "Highlight decentralized nature"]
      }
    ],
    datasets: ["Medical Diagnosis Assistant Training Data"],
    expectedOutcomes: [
      "Understanding of synthetic data benefits",
      "Appreciation for blockchain verification",
      "Interest in healthcare AI applications",
      "Recognition of privacy-preserving solutions"
    ]
  },
  {
    id: "financial-trading",
    title: "Algorithmic Trading Intelligence Platform",
    description: "Showcase real-time market sentiment analysis for automated trading decisions",
    duration: "6-8 minutes",
    targetAudience: ["Financial analysts", "Quantitative traders", "Fintech developers"],
    keyPoints: [
      "Real-time sentiment analysis",
      "Market prediction accuracy",
      "Risk assessment capabilities",
      "Automated trading integration"
    ],
    demoSteps: [
      {
        step: 1,
        action: "Filter by finance category",
        description: "Use marketplace filters to show financial datasets",
        expectedResult: "Display of financial and trading-related datasets",
        tips: ["Show category filtering", "Highlight dataset diversity"]
      },
      {
        step: 2,
        action: "Open sentiment analysis dataset",
        description: "Select 'Financial Market Sentiment Analysis' dataset",
        expectedResult: "25,000 news analyses with 89% prediction accuracy",
        tips: ["Emphasize prediction accuracy", "Show real-time capabilities"]
      },
      {
        step: 3,
        action: "Analyze sample predictions",
        description: "Show news headlines with sentiment scores and market impact",
        expectedResult: "Clear correlation between sentiment and market movements",
        tips: ["Use recent news examples", "Show confidence intervals"]
      },
      {
        step: 4,
        action: "Demonstrate filtering",
        description: "Filter by company ticker or market sector",
        expectedResult: "Targeted analysis for specific stocks or sectors",
        tips: ["Show versatility", "Highlight customization options"]
      },
      {
        step: 5,
        action: "Show integration potential",
        description: "Explain API integration for trading systems",
        expectedResult: "Understanding of practical implementation",
        tips: ["Mention real-time feeds", "Discuss risk management"]
      }
    ],
    datasets: ["Financial Market Sentiment Analysis"],
    expectedOutcomes: [
      "Appreciation for AI-driven trading",
      "Understanding of sentiment analysis value",
      "Interest in market prediction tools",
      "Recognition of data quality importance"
    ]
  },
  {
    id: "ecommerce-personalization",
    title: "Next-Generation E-commerce Personalization",
    description: "Demonstrate customer behavior analysis for building advanced recommendation engines",
    duration: "5-7 minutes",
    targetAudience: ["E-commerce managers", "Product managers", "Marketing professionals"],
    keyPoints: [
      "Customer behavior insights",
      "Personalization algorithms",
      "Privacy-preserving analytics",
      "Conversion optimization"
    ],
    demoSteps: [
      {
        step: 1,
        action: "Navigate to e-commerce dataset",
        description: "Show 'E-commerce Product Recommendations' dataset",
        expectedResult: "50,000 customer interactions with recommendation data",
        tips: ["Highlight scale", "Show interaction diversity"]
      },
      {
        step: 2,
        action: "Explore customer segments",
        description: "Show different user behavior patterns",
        expectedResult: "Clear segmentation with distinct preferences",
        tips: ["Show personalization potential", "Highlight pattern recognition"]
      },
      {
        step: 3,
        action: "Analyze recommendation accuracy",
        description: "Display conversion rates and click-through metrics",
        expectedResult: "12% CTR improvement and 8% conversion rate",
        tips: ["Emphasize business impact", "Show ROI potential"]
      },
      {
        step: 4,
        action: "Show privacy features",
        description: "Explain synthetic data benefits for customer privacy",
        expectedResult: "Understanding of privacy-preserving personalization",
        tips: ["Address privacy concerns", "Show compliance benefits"]
      }
    ],
    datasets: ["E-commerce Product Recommendations"],
    expectedOutcomes: [
      "Understanding of personalization value",
      "Appreciation for privacy protection",
      "Interest in recommendation systems",
      "Recognition of business impact"
    ]
  },
  {
    id: "legal-automation",
    title: "Intelligent Legal Document Analysis",
    description: "Showcase automated contract review and legal risk assessment capabilities",
    duration: "7-9 minutes",
    targetAudience: ["Legal professionals", "Compliance officers", "Legal tech developers"],
    keyPoints: [
      "Automated document analysis",
      "Risk assessment accuracy",
      "Compliance verification",
      "Legal workflow optimization"
    ],
    demoSteps: [
      {
        step: 1,
        action: "Access legal dataset",
        description: "Show 'Legal Document Analysis & Classification' dataset",
        expectedResult: "8,500 legal documents with analysis results",
        tips: ["Highlight document variety", "Show analysis depth"]
      },
      {
        step: 2,
        action: "Demonstrate clause extraction",
        description: "Show key clause identification in contracts",
        expectedResult: "93% accuracy in clause extraction",
        tips: ["Show practical examples", "Highlight precision"]
      },
      {
        step: 3,
        action: "Show risk assessment",
        description: "Display automated risk level categorization",
        expectedResult: "Clear risk indicators with explanations",
        tips: ["Explain risk factors", "Show decision support"]
      },
      {
        step: 4,
        action: "Verify compliance status",
        description: "Show compliance checking capabilities",
        expectedResult: "Automated compliance verification results",
        tips: ["Highlight regulatory benefits", "Show audit trails"]
      }
    ],
    datasets: ["Legal Document Analysis & Classification"],
    expectedOutcomes: [
      "Understanding of legal AI potential",
      "Appreciation for automation benefits",
      "Interest in compliance tools",
      "Recognition of efficiency gains"
    ]
  }
];

export const presentationTips = {
  preparation: [
    "Test all demo scenarios beforehand",
    "Prepare backup datasets in case of issues",
    "Have sample questions ready for audience engagement",
    "Ensure stable internet connection for blockchain interactions",
    "Practice transitions between different scenarios"
  ],
  delivery: [
    "Start with the most relevant scenario for your audience",
    "Use real-world examples that resonate with attendees",
    "Highlight unique blockchain and decentralization benefits",
    "Address privacy and security concerns proactively",
    "Show both technical capabilities and business value"
  ],
  troubleshooting: [
    "Have screenshots ready as backup",
    "Prepare offline demo data if needed",
    "Know common error messages and solutions",
    "Have alternative scenarios ready",
    "Practice explaining technical concepts simply"
  ]
};

export const audienceCustomization = {
  technical: {
    focus: ["Architecture", "Blockchain integration", "API capabilities", "Data quality metrics"],
    language: "Technical terminology, detailed explanations, code examples",
    duration: "Longer, more detailed demos"
  },
  business: {
    focus: ["ROI", "Business value", "Market opportunities", "Competitive advantages"],
    language: "Business terminology, outcome-focused, practical benefits",
    duration: "Shorter, impact-focused demos"
  },
  healthcare: {
    focus: ["Privacy compliance", "Medical accuracy", "Regulatory benefits", "Patient safety"],
    language: "Medical terminology, compliance focus, safety emphasis",
    duration: "Medium, compliance-heavy"
  },
  finance: {
    focus: ["Market accuracy", "Risk management", "Regulatory compliance", "Trading integration"],
    language: "Financial terminology, risk-focused, performance metrics",
    duration: "Medium, performance-focused"
  }
};

export const keyMessages = {
  platform: "Filethetic is the first decentralized marketplace for high-quality synthetic datasets",
  blockchain: "Blockchain verification ensures data integrity and creator attribution",
  privacy: "Synthetic data enables AI training without compromising real user privacy",
  quality: "Expert verification and quality metrics guarantee dataset reliability",
  accessibility: "Democratizing access to high-quality training data for AI development",
  innovation: "Enabling breakthrough AI applications across healthcare, finance, and beyond"
};