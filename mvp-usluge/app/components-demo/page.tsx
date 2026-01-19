"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

export default function ComponentsDemoPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validacija
    if (!email.includes("@")) {
      setEmailError("Nevalidna email adresa");
      return;
    }
    
    setEmailError("");
    setIsLoading(true);

    // Simulacija API poziva
    setTimeout(() => {
      setIsLoading(false);
      alert(`Prijava: ${email}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            UI Components Demo
          </h1>
          <p className="text-gray-600">
            Prikaz reusable komponenti: Button, Input, Card
          </p>
        </div>

        {/* Button Component Demo */}
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Button Component</h2>
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Različite varijante i veličine dugmadi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Variants */}
                <div>
                  <p className="text-sm font-medium mb-2">Variants:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <p className="text-sm font-medium mb-2">Sizes:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* States */}
                <div>
                  <p className="text-sm font-medium mb-2">States:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button isLoading>Loading...</Button>
                    <Button disabled>Disabled</Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Component Demo */}
        <section>
          <h2 className="text-2xl font-bold mb-4">2. Input Component</h2>
          <Card variant="bordered" padding="lg">
            <CardHeader>
              <CardTitle>Input Fields</CardTitle>
              <CardDescription>
                Različiti tipovi input polja sa validacijom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Email adresa"
                  type="email"
                  placeholder="vas@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  required
                  fullWidth
                />

                <Input
                  label="Lozinka"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Minimum 6 karaktera"
                  fullWidth
                />

                <Input
                  label="Pretraga"
                  type="text"
                  placeholder="Pretražite usluge..."
                  leftIcon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                  fullWidth
                />

                <Input
                  label="Telefon"
                  type="tel"
                  placeholder="+381 60 123 4567"
                  disabled
                  fullWidth
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Component Demo */}
        <section>
          <h2 className="text-2xl font-bold mb-4">3. Card Component</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Default Card */}
            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Osnovna kartica</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ovo je primer default kartice sa osnovnim stilom.
                </p>
              </CardContent>
            </Card>

            {/* Bordered Card */}
            <Card variant="bordered" padding="md">
              <CardHeader>
                <CardTitle>Bordered Card</CardTitle>
                <CardDescription>Sa border-om</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Kartica sa vidljivim border-om.
                </p>
              </CardContent>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated" padding="md" hoverable>
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Sa senkom i hover efektom</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Kartica sa senkom koja se uvećava na hover.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Login Form Example */}
        <section>
          <h2 className="text-2xl font-bold mb-4">4. Kompletan Primer - Login Form</h2>
          <div className="max-w-md mx-auto">
            <Card variant="elevated" padding="lg">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Prijava na sistem</CardTitle>
                  <CardDescription>
                    Unesite svoje kredencijale
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="vas@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                    required
                    fullWidth
                  />
                  <Input
                    label="Lozinka"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                  />
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    fullWidth
                  >
                    {isLoading ? "Prijavljivanje..." : "Prijavi se"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    onClick={() => alert("Zaboravljena lozinka")}
                  >
                    Zaboravili ste lozinku?
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}