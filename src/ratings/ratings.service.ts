import { Injectable } from '@nestjs/common';
import { AggregateRating, Rating } from './interfaces';

@Injectable()
export class RatingsService {
  public computeAverage(ratingValues: number[]): number {
    if (ratingValues.length < 1) return null;

    const total = ratingValues.reduce((sum, value) => sum + value, 0);
    const average = total / ratingValues.length;
    return parseFloat(average.toFixed(2));
  }

  public computeAggregateRating(ratings: Rating[]): AggregateRating {
    if (ratings.length < 1) return null;

    const { itemReviewed } = ratings[0];
    const ratingValues = ratings.map((rating) => rating.ratingValue);
    const average = this.computeAverage(ratingValues);

    return {
      itemReviewed,
      ratingCount: ratings.length,
      ratingValue: average,
    };
  }

  private filterRatingsByItem({
    ratings,
    itemReviewed,
  }: {
    ratings: Rating[];
    itemReviewed: string;
  }): Rating[] {
    return ratings.filter((rating) => rating.itemReviewed === itemReviewed);
  }

  private sortByDescendingRatingValue(a: AggregateRating, b: AggregateRating) {
    if (a.ratingValue > b.ratingValue) {
      return -1;
    }

    if (a.ratingValue < b.ratingValue) {
      return 1;
    }

    return 0;
  }

  public computeAggregateRatings(ratings: Rating[]): AggregateRating[] {
    if (ratings.length < 1) return null;

    const uniqueItemsReviewed = Array.from(
      new Set(ratings.map((rating) => rating.itemReviewed)),
    );

    const aggregateRatings = uniqueItemsReviewed.map((itemReviewed) => {
      const filteredRatings = this.filterRatingsByItem({
        ratings,
        itemReviewed,
      });
      return this.computeAggregateRating(filteredRatings);
    });

    return aggregateRatings.sort(this.sortByDescendingRatingValue);
  }
}
