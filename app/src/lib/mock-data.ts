import { Dataset } from "@/types/dataset";

// Mock datasets for development and demo scenarios
export const mockDatasets: Dataset[] = [
  {
    id: "1",
    name: "Medical Diagnosis Assistant Training Data",
    description: "Comprehensive dataset of medical symptoms, diagnoses, and treatment recommendations for training AI medical assistants",
    owner: "0x742d35Cc6634C0532925a3b8D404fddF4b34c451",
    model: "GPT-4",
    categories: ["Medical", "Healthcare"],
    numRows: 15000,
    isVerified: true,
    verifier: "0xMedicalVerifier1",
    price: 0.25,
    createdAt: new Date("2024-11-01"),
    metadata: {
      schema: {
        symptoms: "string",
        patient_age: "number",
        patient_gender: "string",
        medical_history: "string",
        diagnosis: "string",
        treatment_plan: "string",
        confidence_score: "number"
      },
      sampleData: [
        { 
          symptoms: "Persistent cough, fever, shortness of breath", 
          patient_age: 45, 
          patient_gender: "Female",
          medical_history: "No significant medical history",
          diagnosis: "Possible respiratory infection", 
          treatment_plan: "Chest X-ray, blood work, antibiotic course if bacterial",
          confidence_score: 0.87 
        }
      ],
      metrics: {
        accuracy: 0.94,
        diversity: 0.91,
        clinical_relevance: 0.96
      }
    },
    ipfsHash: "QmMedicalDiagnosisData2024",
    isPrivate: false
  },
  {
    id: "2",
    name: "Financial Market Sentiment Analysis",
    description: "Real-time financial news sentiment data with market impact predictions for algorithmic trading systems",
    owner: "0x8ba1f109551bD432803012645Hac136c30C6213",
    model: "Claude-3",
    categories: ["Finance", "Trading"],
    numRows: 25000,
    isVerified: true,
    verifier: "0xFinanceVerifier1",
    price: 0.45,
    createdAt: new Date("2024-10-28"),
    metadata: {
      schema: {
        news_headline: "string",
        news_content: "string",
        company_ticker: "string",
        sentiment_score: "number",
        market_impact: "string",
        price_prediction: "number",
        confidence: "number"
      },
      sampleData: [
        { 
          news_headline: "Apple Reports Record Q4 Earnings, Beats Expectations",
          news_content: "Apple Inc. announced quarterly earnings that exceeded analyst expectations...",
          company_ticker: "AAPL",
          sentiment_score: 0.85,
          market_impact: "Positive",
          price_prediction: 2.3,
          confidence: 0.92
        }
      ],
      metrics: {
        accuracy: 0.89,
        market_correlation: 0.84,
        prediction_accuracy: 0.78
      }
    },
    ipfsHash: "QmFinancialSentimentData",
    isPrivate: false
  },
  {
    id: "3",
    name: "E-commerce Product Recommendations",
    description: "Customer behavior and product interaction data for building personalized recommendation engines",
    owner: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    model: "Llama-2",
    categories: ["E-commerce", "Recommendations"],
    numRows: 50000,
    isVerified: false,
    price: 0.15,
    createdAt: new Date("2024-11-05"),
    metadata: {
      schema: {
        user_id: "string",
        product_id: "string",
        category: "string",
        interaction_type: "string",
        rating: "number",
        purchase_history: "array",
        recommended_products: "array"
      },
      sampleData: [
        { 
          user_id: "user_12345",
          product_id: "prod_67890",
          category: "Electronics",
          interaction_type: "purchase",
          rating: 4.5,
          purchase_history: ["prod_11111", "prod_22222"],
          recommended_products: ["prod_33333", "prod_44444", "prod_55555"]
        }
      ],
      metrics: {
        click_through_rate: 0.12,
        conversion_rate: 0.08,
        user_satisfaction: 0.86
      }
    },
    ipfsHash: "QmEcommerceRecommendations",
    isPrivate: false
  },
  {
    id: "4",
    name: "Legal Document Analysis & Classification",
    description: "Comprehensive legal document dataset for contract analysis, clause extraction, and legal risk assessment",
    owner: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    model: "GPT-4",
    categories: ["Legal", "Document Analysis"],
    numRows: 8500,
    isVerified: true,
    verifier: "0xLegalVerifier1",
    price: 0.35,
    createdAt: new Date("2024-10-15"),
    metadata: {
      schema: {
        document_type: "string",
        document_text: "string",
        key_clauses: "array",
        risk_level: "string",
        compliance_status: "string",
        extracted_entities: "array"
      },
      sampleData: [
        { 
          document_type: "Employment Contract",
          document_text: "This employment agreement is entered into between...",
          key_clauses: ["termination", "confidentiality", "compensation"],
          risk_level: "Low",
          compliance_status: "Compliant",
          extracted_entities: ["Company Name", "Employee Name", "Start Date"]
        }
      ],
      metrics: {
        accuracy: 0.93,
        clause_extraction_precision: 0.91,
        risk_assessment_accuracy: 0.88
      }
    },
    ipfsHash: "QmLegalDocumentAnalysis",
    isPrivate: false
  },
  {
    id: "5",
    name: "Educational Content Generation",
    description: "Structured educational content with questions, explanations, and difficulty levels for adaptive learning systems",
    owner: "0xA0b86991c431e58e5f121c7b3d50b2f8e4c9f3c2",
    model: "Claude-3",
    categories: ["Education", "Content Generation"],
    numRows: 12000,
    isVerified: true,
    verifier: "0xEducationVerifier1",
    price: 0.20,
    createdAt: new Date("2024-11-10"),
    metadata: {
      schema: {
        subject: "string",
        topic: "string",
        difficulty_level: "string",
        question: "string",
        answer: "string",
        explanation: "string",
        learning_objectives: "array"
      },
      sampleData: [
        { 
          subject: "Mathematics",
          topic: "Calculus - Derivatives",
          difficulty_level: "Intermediate",
          question: "Find the derivative of f(x) = 3x² + 2x - 1",
          answer: "f'(x) = 6x + 2",
          explanation: "Using the power rule, the derivative of x^n is nx^(n-1)...",
          learning_objectives: ["Apply power rule", "Understand derivatives"]
        }
      ],
      metrics: {
        content_quality: 0.92,
        educational_effectiveness: 0.89,
        student_engagement: 0.85
      }
    },
    ipfsHash: "QmEducationalContent2024",
    isPrivate: false
  },
  {
    id: "6",
    name: "Cybersecurity Threat Intelligence",
    description: "Threat patterns, attack vectors, and security incident data for training cybersecurity AI systems",
    owner: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    model: "GPT-4",
    categories: ["Cybersecurity", "Threat Intelligence"],
    numRows: 18000,
    isVerified: true,
    verifier: "0xSecurityVerifier1",
    price: 0.55,
    createdAt: new Date("2024-10-20"),
    metadata: {
      schema: {
        threat_type: "string",
        attack_vector: "string",
        indicators_of_compromise: "array",
        severity_level: "string",
        mitigation_steps: "array",
        affected_systems: "array"
      },
      sampleData: [
        { 
          threat_type: "Phishing",
          attack_vector: "Email",
          indicators_of_compromise: ["suspicious_domain.com", "malicious_attachment.exe"],
          severity_level: "High",
          mitigation_steps: ["Block domain", "Update email filters", "User training"],
          affected_systems: ["Email servers", "Workstations"]
        }
      ],
      metrics: {
        threat_detection_accuracy: 0.96,
        false_positive_rate: 0.03,
        response_time_improvement: 0.67
      }
    },
    ipfsHash: "QmCybersecurityThreats",
    isPrivate: false
  },
  {
    id: "7",
    name: "Climate Change Impact Modeling",
    description: "Environmental data and climate projections for training predictive models on climate change impacts",
    owner: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    model: "Mistral-7B",
    categories: ["Climate", "Environmental"],
    numRows: 22000,
    isVerified: false,
    price: 0.30,
    createdAt: new Date("2024-11-08"),
    metadata: {
      schema: {
        location: "string",
        temperature_data: "array",
        precipitation_data: "array",
        co2_levels: "number",
        predicted_impact: "string",
        confidence_interval: "array"
      },
      sampleData: [
        { 
          location: "California, USA",
          temperature_data: [15.2, 16.8, 18.1, 19.5],
          precipitation_data: [120, 95, 80, 65],
          co2_levels: 421.5,
          predicted_impact: "Increased drought risk, higher wildfire probability",
          confidence_interval: [0.75, 0.92]
        }
      ],
      metrics: {
        prediction_accuracy: 0.84,
        model_reliability: 0.88,
        data_completeness: 0.93
      }
    },
    ipfsHash: "QmClimateModelingData",
    isPrivate: false
  },
  {
    id: "8",
    name: "Autonomous Vehicle Training Scenarios",
    description: "Driving scenarios, traffic patterns, and decision-making data for training autonomous vehicle AI systems",
    owner: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    model: "GPT-4",
    categories: ["Automotive", "AI Training"],
    numRows: 35000,
    isVerified: true,
    verifier: "0xAutomotiveVerifier1",
    price: 0.65,
    createdAt: new Date("2024-10-25"),
    metadata: {
      schema: {
        scenario_type: "string",
        weather_conditions: "string",
        traffic_density: "string",
        road_type: "string",
        obstacles: "array",
        optimal_action: "string",
        safety_score: "number"
      },
      sampleData: [
        { 
          scenario_type: "Urban intersection",
          weather_conditions: "Clear",
          traffic_density: "Moderate",
          road_type: "City street",
          obstacles: ["Pedestrian crossing", "Cyclist in bike lane"],
          optimal_action: "Reduce speed, yield to pedestrian",
          safety_score: 0.95
        }
      ],
      metrics: {
        scenario_realism: 0.94,
        safety_compliance: 0.98,
        decision_accuracy: 0.91
      }
    },
    ipfsHash: "QmAutonomousVehicleData",
    isPrivate: false
  }
];

// Demo scenarios for presentations
export const demoScenarios = {
  healthcare: {
    title: "AI-Powered Medical Diagnosis",
    description: "Demonstrate how synthetic medical data can train AI assistants to help doctors with diagnosis",
    dataset: "Medical Diagnosis Assistant Training Data",
    keyFeatures: [
      "15,000 synthetic patient cases",
      "94% diagnostic accuracy",
      "HIPAA-compliant synthetic data",
      "Verified by medical professionals"
    ],
    demoScript: [
      "Show the medical dataset with patient symptoms and diagnoses",
      "Highlight the verification status and quality metrics",
      "Demonstrate the data preview with realistic medical scenarios",
      "Explain how this data can train AI without privacy concerns"
    ]
  },
  finance: {
    title: "Algorithmic Trading Intelligence",
    description: "Real-time market sentiment analysis for automated trading decisions",
    dataset: "Financial Market Sentiment Analysis",
    keyFeatures: [
      "25,000 news sentiment analyses",
      "89% market prediction accuracy",
      "Real-time processing capability",
      "Multi-asset class coverage"
    ],
    demoScript: [
      "Display financial news sentiment dataset",
      "Show correlation between sentiment and market movements",
      "Highlight the prediction accuracy metrics",
      "Demonstrate filtering by company or market sector"
    ]
  },
  ecommerce: {
    title: "Personalized Shopping Experience",
    description: "Customer behavior data for building next-generation recommendation engines",
    dataset: "E-commerce Product Recommendations",
    keyFeatures: [
      "50,000 customer interactions",
      "12% click-through rate improvement",
      "Cross-category recommendations",
      "Privacy-preserving synthetic data"
    ],
    demoScript: [
      "Show customer interaction patterns",
      "Demonstrate recommendation accuracy",
      "Highlight privacy benefits of synthetic data",
      "Show A/B testing results and performance metrics"
    ]
  },
  legal: {
    title: "Intelligent Contract Analysis",
    description: "Automated legal document review and risk assessment",
    dataset: "Legal Document Analysis & Classification",
    keyFeatures: [
      "8,500 legal documents analyzed",
      "93% clause extraction accuracy",
      "Automated risk assessment",
      "Compliance verification"
    ],
    demoScript: [
      "Display legal document classification results",
      "Show key clause extraction capabilities",
      "Demonstrate risk level assessment",
      "Highlight compliance checking features"
    ]
  }
};

// Sample data for quick demos
export const sampleDataPreviews = {
  medical: [
    {
      symptoms: "Chest pain, shortness of breath, dizziness",
      patient_age: 52,
      diagnosis: "Possible cardiac event - requires immediate evaluation",
      confidence: 0.91
    },
    {
      symptoms: "Persistent headache, nausea, light sensitivity",
      patient_age: 28,
      diagnosis: "Migraine with aura - recommend neurological consultation",
      confidence: 0.87
    }
  ],
  financial: [
    {
      headline: "Tesla Announces New Gigafactory in Texas",
      sentiment: 0.78,
      predicted_impact: "+3.2%",
      confidence: 0.89
    },
    {
      headline: "Federal Reserve Hints at Interest Rate Changes",
      sentiment: -0.23,
      predicted_impact: "-1.8%",
      confidence: 0.76
    }
  ],
  ecommerce: [
    {
      user_segment: "Tech Enthusiast",
      viewed_product: "Wireless Headphones",
      recommendations: ["Bluetooth Speaker", "Phone Case", "Charging Pad"],
      conversion_probability: 0.34
    }
  ]
};
