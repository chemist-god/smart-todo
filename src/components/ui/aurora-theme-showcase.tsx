"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function AuroraThemeShowcase() {
  return (
    <div className="p-8 space-y-8 bg-background text-foreground">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Aurora Theme Showcase</h1>
        <p className="text-muted-foreground">
          A comprehensive demonstration of the Aurora theme's color palette and components.
        </p>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>
            Primary color variations and semantic colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Primary Colors</h3>
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div
                  key={shade}
                  className="w-12 h-12 rounded-lg border border-border flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `oklch(${shade === 500 ? '0.55 0.15 260' : shade < 500 ? `0.${98 - shade/10} 0.0${Math.max(1, shade/100)} 240` : `0.${65 - (shade-500)/10} 0.${15 - (shade-500)/20} 260`})`
                  }}
                >
                  {shade}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Semantic Colors</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-success"></div>
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-warning"></div>
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-info"></div>
                <span className="text-sm">Info</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-destructive"></div>
                <span className="text-sm">Destructive</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Different button styles available in the Aurora theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>
            Themed form inputs and controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Field</label>
            <Input placeholder="Themed input with Aurora colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status Badges</label>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-success text-success-foreground">Success</Badge>
              <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              <Badge className="bg-info text-info-foreground">Info</Badge>
              <Badge variant="destructive">Error</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradients & Effects */}
      <Card>
        <CardHeader>
          <CardTitle>Gradients & Effects</CardTitle>
          <CardDescription>
            Aurora theme gradients and visual effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="gradient-primary p-6 rounded-lg text-primary-foreground">
              <h4 className="font-semibold">Primary Gradient</h4>
              <p className="text-sm opacity-90">Beautiful gradient background</p>
            </div>

            <div className="gradient-success p-6 rounded-lg text-white">
              <h4 className="font-semibold">Success Gradient</h4>
              <p className="text-sm opacity-90">Perfect for success states</p>
            </div>

            <div className="glass p-6 rounded-lg">
              <h4 className="font-semibold">Glass Effect</h4>
              <p className="text-sm text-muted-foreground">Modern glassmorphism</p>
            </div>

            <div className="glass-dark p-6 rounded-lg">
              <h4 className="font-semibold">Dark Glass</h4>
              <p className="text-sm text-muted-foreground">Dark mode glass effect</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive States */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive States</CardTitle>
          <CardDescription>
            Hover, focus, and active states with Aurora theming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <h4 className="font-medium">Hover State</h4>
              <p className="text-sm text-muted-foreground">Hover to see accent colors</p>
            </div>

            <div className="p-4 border border-border rounded-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <h4 className="font-medium">Focus State</h4>
              <p className="text-sm text-muted-foreground">Focus ring with theme colors</p>
            </div>

            <div className="p-4 bg-primary text-primary-foreground rounded-lg shadow-medium hover:shadow-strong transition-all">
              <h4 className="font-medium">Shadow Effects</h4>
              <p className="text-sm opacity-90">Soft to strong shadow transition</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Information */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Information</CardTitle>
          <CardDescription>
            Technical details about the Aurora theme implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Color Space</h4>
              <p className="text-sm text-muted-foreground">OKLCH for better color consistency</p>

              <h4 className="font-semibold">Accessibility</h4>
              <p className="text-sm text-muted-foreground">WCAG 2.1 AA compliant contrast ratios</p>

              <h4 className="font-semibold">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Automatic dark mode support</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Framework</h4>
              <p className="text-sm text-muted-foreground">Shadcn UI with Tailwind CSS v4</p>

              <h4 className="font-semibold">Browser Support</h4>
              <p className="text-sm text-muted-foreground">95%+ global browser support</p>

              <h4 className="font-semibold">Customization</h4>
              <p className="text-sm text-muted-foreground">Easy to extend and customize</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
