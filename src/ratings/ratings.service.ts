import { Injectable } from '@nestjs/common';
import { AggregateRating, Rating } from './interfaces';
import { AggregateRatingGiven } from './interfaces/aggregate-rating-given';
import { CreativeWork } from './interfaces/creative-work';

@Injectable()
export class RatingsService {
  public computeAverage(ratingValues: number[]): number {
    if (ratingValues.length < 1) return null;

    const total = ratingValues.reduce((sum, value) => sum + value, 0);
    const average = total / ratingValues.length;
    return parseFloat(average.toFixed(2));
  }

  private computeAggregateRatingGiven(ratings: Rating[]): AggregateRatingGiven {
    if (ratings.length < 1) return null;

    const { author } = ratings[0];
    const ratingValues = ratings.map((rating) => rating.ratingValue);
    const average = this.computeAverage(ratingValues);

    return {
      author,
      ratingCount: ratings.length,
      ratingValue: average,
    };
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

  private filterRatingsByAuthor({
    ratings,
    author,
  }: {
    ratings: Rating[];
    author: string;
  }): Rating[] {
    return ratings.filter((rating) => rating.author === author);
  }

  private filterRatingsByItem({
    ratings,
    itemReviewed,
  }: {
    ratings: Rating[];
    itemReviewed: CreativeWork;
  }): Rating[] {
    return ratings.filter(
      (rating) => rating.itemReviewed.id === itemReviewed.id,
    );
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

  private getUniqueObjectsById<T extends { id: string }>(
    objectsWithId: T[],
  ): T[] {
    const uniqueIds = Array.from(
      new Set(objectsWithId.map((objectWithId) => objectWithId.id)),
    );

    return uniqueIds.map((id) =>
      objectsWithId.find((object) => object.id === id),
    );
  }

  public computeStandardAggregateRatings(ratings: Rating[]): AggregateRating[] {
    if (ratings.length < 1) return null;

    const uniqueItemsReviewed = this.getUniqueObjectsById(
      ratings.map((rating) => rating.itemReviewed),
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

  private getAggregateRatingGiven({
    author,
    ratings,
  }: {
    author: string;
    ratings: Rating[];
  }): AggregateRatingGiven {
    const filteredRatings = this.filterRatingsByAuthor({ ratings, author });

    return this.computeAggregateRatingGiven(filteredRatings);
  }

  private computeOwnRatingsByItemReviewed(ratings: Rating[]) {
    if (ratings.length < 1) return null;

    const uniqueAuthors = Array.from(
      new Set(ratings.map((rating) => rating.author)),
    );

    if (uniqueAuthors.length < 2) return null;

    const aggregateRatingsGivenByAuthor = uniqueAuthors.map((author) =>
      this.getAggregateRatingGiven({ author, ratings }),
    );

    const uniqueItemsReviewed = this.getUniqueObjectsById(
      ratings.map((rating) => rating.itemReviewed),
    );

    return uniqueItemsReviewed.map((itemReviewed) => {
      const aggregateRatingGiven = aggregateRatingsGivenByAuthor.find(
        (aggregateRatingGiven) =>
          aggregateRatingGiven.author === itemReviewed.owner,
      );

      if (!aggregateRatingGiven) return null;

      return {
        itemReviewed,
        author: itemReviewed.owner,
        ratingValue: aggregateRatingGiven.ratingValue,
        ratingCount: aggregateRatingGiven.ratingCount,
      } as Rating;
    });
  }

  public computeStandardCompensatedAggregateRatings(
    ratings: Rating[],
  ): AggregateRating[] {
    const ownRatingsByItemReviewed =
      this.computeOwnRatingsByItemReviewed(ratings);

    if (ownRatingsByItemReviewed === null) return null;

    return this.computeStandardAggregateRatings([
      ...ratings,
      ...ownRatingsByItemReviewed.filter((ownRating) => ownRating !== null),
    ]);
  }

  public computeHeavilyCompensatedAggregateRatings(ratings: Rating[]) {
    const ownRatingsByItemReviewed =
      this.computeOwnRatingsByItemReviewed(ratings);

    if (ownRatingsByItemReviewed === null) return null;

    const standardAggregateRatings =
      this.computeStandardAggregateRatings(ratings);

    return standardAggregateRatings.map((aggregateRating) => {
      const ownRating = ownRatingsByItemReviewed.find(
        (rating) => rating.itemReviewed.id === aggregateRating.itemReviewed.id,
      );
      return {
        itemReviewed: aggregateRating.itemReviewed,
        ratingCount: aggregateRating.ratingCount + 1,
        ratingValue: (aggregateRating.ratingValue + ownRating.ratingValue) / 2,
      };
    });
  }
}
