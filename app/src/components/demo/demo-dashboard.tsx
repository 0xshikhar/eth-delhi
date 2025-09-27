"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Target,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";
import { demoScenarios, presentationTips, audienceCustomization, keyMessages } from "@/lib/demo-scenarios";
import type { DemoScenario } from "@/lib/demo-scenarios";

interface DemoDashboardProps {
  onStartDemo?: (scenarioId: string) => void;
}

export function DemoDashboard({ onStartDemo }: DemoDashboardProps) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStartDemo = (scenarioId: string) => {
    const scenario = demoScenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setCurrentStep(0);
      onStartDemo?.(scenarioId);
    }
  };

  const nextStep = () => {
    if (selectedScenario && currentStep < selectedScenario.demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Filethetic Demo Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Interactive demo scenarios to showcase the power of decentralized synthetic data marketplace
        </p>
      </div>

      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scenarios">Demo Scenarios</TabsTrigger>
          <TabsTrigger value="active">Active Demo</TabsTrigger>
          <TabsTrigger value="tips">Presentation Tips</TabsTrigger>
          <TabsTrigger value="messages">Key Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{scenario.title}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {scenario.duration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Target Audience
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {scenario.targetAudience.map((audience, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Key Points
                    </h4>
                    <ul className="text-sm space-y-1">
                      {scenario.keyPoints.slice(0, 3).map((point, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleStartDemo(scenario.id)}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Demo
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          {selectedScenario ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Active Demo: {selectedScenario.title}
                  </CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {selectedScenario.demoSteps.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / selectedScenario.demoSteps.length) * 100}%` }}
                    />
                  </div>

                  {selectedScenario.demoSteps[currentStep] && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h3 className="font-semibold text-lg mb-2">
                          Step {selectedScenario.demoSteps[currentStep].step}: {selectedScenario.demoSteps[currentStep].action}
                        </h3>
                        <p className="text-gray-700 mb-3">
                          {selectedScenario.demoSteps[currentStep].description}
                        </p>
                        <div className="bg-white p-3 rounded border">
                          <strong>Expected Result:</strong> {selectedScenario.demoSteps[currentStep].expectedResult}
                        </div>
                      </div>

                      {selectedScenario.demoSteps[currentStep].tips && (
                        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4" />
                            Presentation Tips
                          </h4>
                          <ul className="space-y-1">
                            {selectedScenario.demoSteps[currentStep].tips!.map((tip, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-600" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={prevStep}
                          disabled={currentStep === 0}
                        >
                          Previous Step
                        </Button>
                        <Button 
                          onClick={nextStep}
                          disabled={currentStep === selectedScenario.demoSteps.length - 1}
                        >
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Play className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Active Demo</h3>
                <p className="text-muted-foreground mb-4">
                  Select a demo scenario from the "Demo Scenarios" tab to get started
                </p>
                <Button onClick={() => {
                  const scenariosTab = document.querySelector('[value="scenarios"]') as HTMLElement;
                  scenariosTab?.click();
                }}>
                  Browse Scenarios
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Preparation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {presentationTips.preparation.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {presentationTips.delivery.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {presentationTips.troubleshooting.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Audience Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(audienceCustomization).map(([key, config]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <h4 className="font-semibold capitalize mb-2">{key}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Focus:</strong>
                        <ul className="mt-1 space-y-1">
                          {config.focus.map((item, index) => (
                            <li key={index} className="text-xs text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Language:</strong>
                        <p className="text-xs text-muted-foreground mt-1">{config.language}</p>
                      </div>
                      <div>
                        <strong>Duration:</strong>
                        <p className="text-xs text-muted-foreground mt-1">{config.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Key Messages & Value Propositions
              </CardTitle>
              <CardDescription>
                Core messages to emphasize throughout your presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(keyMessages).map(([key, message]) => (
                  <div key={key} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-semibold capitalize mb-2 text-blue-600">{key.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-700">{message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Flow Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Opening (2-3 minutes)</h4>
                <ul className="text-sm space-y-1">
                  <li>• Introduce Filethetic as the first decentralized synthetic data marketplace</li>
                  <li>• Highlight the privacy and quality benefits</li>
                  <li>• Set expectations for the demo</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">Main Demo (15-20 minutes)</h4>
                <ul className="text-sm space-y-1">
                  <li>• Choose 2-3 scenarios based on audience</li>
                  <li>• Show marketplace navigation and filtering</li>
                  <li>• Demonstrate data quality and verification</li>
                  <li>• Highlight blockchain integration</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Closing (3-5 minutes)</h4>
                <ul className="text-sm space-y-1">
                  <li>• Summarize key benefits and differentiators</li>
                  <li>• Address questions and concerns</li>
                  <li>• Provide next steps and contact information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}