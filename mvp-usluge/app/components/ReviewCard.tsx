"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";

interface ReviewCardProps {
  id: string;
  rating: number;
  comment: string;
  author: {
    firstName: string;
    lastName: string;
    email?: string;
  };
  createdAt: string;
  response?: string;
  responseDate?: string;
}

export default function ReviewCard({
  id,
  rating,
  comment,
  author,
  createdAt,
  response,
  responseDate,
}: ReviewCardProps) {
  const { data: session } = useSession();
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReportReview = async () => {
    if (
      !window.confirm(
        "Jeste li sigurni da želite da prijavite ovu ocenu kao neprikladnu?"
      )
    ) {
      return;
    }

    setIsReporting(true);

    try {
      const response = await fetch(`/api/reviews/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri prijavi ocene");
      }

      setReported(true);
      alert("✅ Hvala vam na prijavi. Naš tim će pregledati sadržaj.");
    } catch (error: any) {
      alert(error.message || "Greška pri prijavi ocene");
    } finally {
      setIsReporting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("sr-RS");
  };

  const stars = (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={
            i < rating
              ? "text-yellow-400"
              : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <Card variant="bordered" padding="lg" className="mb-4">
      <CardContent>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-semibold text-gray-900">
              {author.firstName} {author.lastName}
            </div>
            <div className="text-sm text-gray-500">{formatDate(createdAt)}</div>
          </div>
          <div className="text-right">{stars}</div>
        </div>

        {/* Comment */}
        <p className="text-gray-700 mb-4">{comment}</p>

        {/* Response */}
        {response && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <div className="text-sm font-medium text-blue-900 mb-1">
              📢 Odgovor pružaoca:
            </div>
            <p className="text-sm text-blue-800 mb-2">{response}</p>
            <div className="text-xs text-blue-600">
              {responseDate && `Odgovoren: ${formatDate(responseDate)}`}
            </div>
          </div>
        )}

        {/* Report Button */}
        {session && (
          <div className="border-t pt-3 mt-4">
            {reported ? (
              <div className="text-sm text-green-600 font-medium">
                ✅ Hvala na prijavi
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={isReporting}
                onClick={handleReportReview}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {isReporting ? "Prijavljuje se..." : "🚩 Prijavi ocenu"}
              </Button>
            )}
          </div>
        )}

        {/* Login Prompt */}
        {!session && (
          <div className="text-xs text-gray-500 italic">
            Prijavite se da biste prijavili ovu ocenu
          </div>
        )}
      </CardContent>
    </Card>
  );
}
