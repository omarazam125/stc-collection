"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Sparkles, Loader2, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { type CallScenario, getAllScenarios, saveCustomScenario, deleteCustomScenario } from "@/lib/call-scenarios"

export default function TemplatesPage() {
  const [scenarios, setScenarios] = useState<CallScenario[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    requiredFields: "",
    optionalFields: "",
  })

  useEffect(() => {
    setScenarios(getAllScenarios())
  }, [])

  const handleAIGenerate = async () => {
    if (!newTemplate.description) {
      alert("Please provide a description for the AI to generate a prompt")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/gemini/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newTemplate.description,
          scenarioType: newTemplate.name,
        }),
      })

      if (response.ok) {
        try {
          const data = await response.json()
          setNewTemplate({ ...newTemplate, systemPrompt: data.prompt })
        } catch (jsonError) {
          console.error("[v0] Error parsing AI response:", jsonError)
          alert("Failed to parse AI-generated prompt")
        }
      } else {
        alert("Failed to generate prompt with AI")
      }
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      alert("Error generating prompt")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.systemPrompt) {
      alert("Please fill in template name and system prompt")
      return
    }

    const scenario: CallScenario = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      systemPrompt: newTemplate.systemPrompt,
      requiredFields: newTemplate.requiredFields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      optionalFields: newTemplate.optionalFields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      isCustom: true,
    }

    saveCustomScenario(scenario)
    setScenarios(getAllScenarios())
    setIsCreating(false)
    setNewTemplate({
      name: "",
      description: "",
      systemPrompt: "",
      requiredFields: "",
      optionalFields: "",
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteCustomScenario(id)
      setScenarios(getAllScenarios())
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold text-foreground">Prompt Templates</h1>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              Create and manage custom call scenarios and prompts
            </p>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Template
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-6 border-primary/50 bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Create New Prompt Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., VIP Customer Follow-up"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-desc">Description *</Label>
                  <Input
                    id="template-desc"
                    placeholder="Brief description of this scenario"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label htmlFor="system-prompt">System Prompt *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !newTemplate.description}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        AI Generate Prompt
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="system-prompt"
                  placeholder="Write your system prompt here, or use AI to generate it..."
                  rows={12}
                  value={newTemplate.systemPrompt}
                  onChange={(e) => setNewTemplate({ ...newTemplate, systemPrompt: e.target.value })}
                  className="font-mono text-sm"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Use placeholders like {"{customer_name}"}, {"{phone_number}"}, {"{customer_email}"}, etc.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="required-fields">Required Fields (comma-separated)</Label>
                  <Input
                    id="required-fields"
                    placeholder="customerName, phoneNumber, customerEmail"
                    value={newTemplate.requiredFields}
                    onChange={(e) => setNewTemplate({ ...newTemplate, requiredFields: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="optional-fields">Optional Fields (comma-separated)</Label>
                  <Input
                    id="optional-fields"
                    placeholder="notes, accountBalance"
                    value={newTemplate.optionalFields}
                    onChange={(e) => setNewTemplate({ ...newTemplate, optionalFields: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveTemplate} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-sans text-lg font-semibold text-card-foreground">
                      {scenario.name}
                    </CardTitle>
                    <p className="mt-1 font-sans text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                  {scenario.isCustom && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      Custom
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Required Fields:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {scenario.requiredFields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {scenario.optionalFields.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Optional Fields:</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {scenario.optionalFields.map((field) => (
                          <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {scenario.isCustom && (
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:bg-destructive hover:text-white bg-transparent"
                        onClick={() => handleDelete(scenario.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
