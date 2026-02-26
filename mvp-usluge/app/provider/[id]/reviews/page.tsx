"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ReviewCard from "@/app/components/ReviewCard";

interface Review {
  id: string;
  rating: number;
  comment: string;
  response?: string;
  responseDate?: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    email?: string;
  };
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  averageRating: number;
  totalReviews: number;
  bio?: string;
}

export default function ProviderReviewsPage() {
  const params = useParams();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRating, setFilterRating] = useState<number | "ALL">("ALL");

  useEffect(() => {
    fetchProviderAndReviews();
  }, [providerId]);

  const fetchProviderAndReviews = async () => {
    try {
      setIsLoading(true);

      // Fetch provider info
      const providerRes = await fetch(`/api/users/${providerId}`);
      const providerData = await providerRes.json();

      if (providerRes.ok) {
        setProvider(providerData.data);
      }

      // Fetch reviews for this provider
      const reviewsRes = await fetch(`/api/reviews?targetId=${providerId}`);
      const reviewsData = await reviewsRes.json();

      if (reviewsRes.ok) {
        setReviews(reviewsData.data.reviews || []);
      } else {
        setError(reviewsData.error || "Greška pri učitavanju ocena");
      }
    } catch (err) {
      setError("Greška pri učitavanju podataka");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews =
    filterRating === "ALL"
      ? reviews
      : reviews.filter((r) => r.rating === filterRating);

  const avgRating = Number(provider?.averageRating) || 0;
  const ratingPercentage = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Greška</h3>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link href="/services" className="mt-4 inline-block">
              <Button variant="primary">Nazad na usluge</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="bordered" padding="lg" className="max-w-md">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900">Pružalac nije pronađen</h3>
            <Link href="/services" className="mt-4 inline-block">
              <Button variant="primary">Nazad na usluge</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {provider.companyName || `${provider.firstName} ${provider.lastName}`}
              </h1>
              <p className="text-gray-600 mt-1">Ocene i recenzije</p>
            </div>
            <Link href="/services">
              <Button variant="outline">← Nazad na usluge</Button>
            </Link>
          </div>

          {/* Rating Summary */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Pregled Ocena</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">
                    {avgRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.round(avgRating)
                            ? "text-yellow-400 text-2xl"
                            : "text-gray-300 text-2xl"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2">
                    {reviews.length} {reviews.length === 1 ? "ocena" : "ocena"}
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-12 text-sm font-medium text-gray-700">
                        {rating}★
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full"
                          style={{
                            width: `${
                              reviews.length > 0
                                ? (ratingPercentage[rating as keyof typeof ratingPercentage] /
                                    reviews.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="w-8 text-sm text-gray-600">
                        {ratingPercentage[rating as keyof typeof ratingPercentage]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          {reviews.length > 0 && (
            <Card variant="bordered" padding="lg">
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filterRating === "ALL" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFilterRating("ALL")}
                  >
                    Sve ({reviews.length})
                  </Button>
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingPercentage[rating as keyof typeof ratingPercentage];
                    return (
                      <Button
                        key={rating}
                        variant={filterRating === rating ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setFilterRating(rating)}
                      >
                        {rating}★ ({count})
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <CardContent className="text-center py-12">
                <p className="text-gray-500">
                  {reviews.length === 0
                    ? "Još nema ocena za ovog pružaoca"
                    : "Nema ocena sa ovom ocenom"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  rating={review.rating}
                  comment={review.comment}
                  author={review.author}
                  createdAt={review.createdAt}
                  response={review.response}
                  responseDate={review.responseDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
