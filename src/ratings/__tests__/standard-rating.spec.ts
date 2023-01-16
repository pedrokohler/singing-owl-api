import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../ratings.service';
import { createCreativeWork } from './creative-work.factory';

describe('Standard rating strategy', () => {
  let ratingsService: RatingsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [RatingsService],
    }).compile();

    ratingsService = app.get<RatingsService>(RatingsService);
  });

  describe('Given an array of rating values', () => {
    it('should return null if the array is empty', () => {
      const result = ratingsService.computeAverage([]);
      expect(result).toBeNull();
    });

    it('should compute the average of a single rating value', () => {
      const result = ratingsService.computeAverage([20]);
      expect(result).toBe(20);
    });

    it('should compute the average of two rating values', () => {
      const result = ratingsService.computeAverage([50, 60]);
      expect(result).toBe(55);
    });

    it('should compute the average of multiple rating values', () => {
      const result = ratingsService.computeAverage([52, 58, 70]);
      expect(result).toBe(60);
    });

    it('should compute the average with 2 decimal places', () => {
      const result = ratingsService.computeAverage([10, 25, 65]);
      expect(result).toBe(33.33);

      const result2 = ratingsService.computeAverage([90, 67, 97, 87]);
      expect(result2).toBe(85.25);

      const result3 = ratingsService.computeAverage([90, 100, 10]);
      expect(result3).toBe(66.67);
    });
  });

  describe('Given an array of ratings about the same item', () => {
    it('should return null if the array is empty', () => {
      const result = ratingsService.computeAverage([]);
      expect(result).toBeNull();
    });

    it('should compute the correct aggregate rating from one rating', () => {
      const itemReviewed = createCreativeWork();
      const author = 'author-id';
      const aggregateRating = ratingsService.computeAggregateRating([
        { author, itemReviewed, ratingValue: 43 },
      ]);
      expect(aggregateRating).toEqual({
        itemReviewed,
        ratingCount: 1,
        ratingValue: 43,
      });
    });

    it('should compute the correct aggregate rating from two ratings', () => {
      const itemReviewed = createCreativeWork();
      const author = 'author-id';
      const aggregateRating = ratingsService.computeAggregateRating([
        { author, itemReviewed, ratingValue: 35 },
        { author, itemReviewed, ratingValue: 15 },
      ]);
      expect(aggregateRating).toEqual({
        itemReviewed,
        ratingCount: 2,
        ratingValue: 25,
      });
    });

    it('should compute the correct aggregate rating from multiple ratings', () => {
      const itemReviewed = createCreativeWork();
      const author = 'author-id';
      const aggregateRating = ratingsService.computeAggregateRating([
        { author, itemReviewed, ratingValue: 27 },
        { author, itemReviewed, ratingValue: 12 },
        { author, itemReviewed, ratingValue: 69 },
      ]);
      expect(aggregateRating).toEqual({
        itemReviewed,
        ratingCount: 3,
        ratingValue: 36,
      });
    });
  });

  describe('Given an array of ratings about different items', () => {
    it('should return null if the array is empty', () => {
      const result = ratingsService.computeStandardAggregateRatings([]);
      expect(result).toBeNull();
    });

    it('should compute the aggregate ratings of each item reviewed', () => {
      const itemReviewed = createCreativeWork();
      const secondItemReviewed = createCreativeWork({ id: 'other-item' });
      const author = 'author-id';

      const aggregateRatings = ratingsService.computeStandardAggregateRatings([
        { itemReviewed, author, ratingValue: 2 },
        { itemReviewed, author, ratingValue: 48 },
        { itemReviewed, author, ratingValue: 21 },
        { itemReviewed: secondItemReviewed, author, ratingValue: 13 },
        { itemReviewed: secondItemReviewed, author, ratingValue: 23 },
        { itemReviewed, author, ratingValue: 12 },
      ]);

      expect(aggregateRatings).toHaveLength(2);
      expect(aggregateRatings).toMatchObject(
        expect.arrayContaining([
          {
            itemReviewed: secondItemReviewed,
            ratingCount: 2,
            ratingValue: 18,
          },
          {
            itemReviewed,
            ratingCount: 4,
            ratingValue: 20.75,
          },
        ]),
      );
    });
    it('should order the aggregate ratings of each item reviewed', () => {
      const itemReviewed = createCreativeWork();
      const secondItemReviewed = createCreativeWork({ id: 'other-item' });
      const thirdItemReviewed = createCreativeWork({ id: 'yet-another-item' });
      const fourthItemReviewed = createCreativeWork({
        id: 'yet-again-another-item',
      });
      const author = 'author-id';

      const aggregateRatings = ratingsService.computeStandardAggregateRatings([
        { itemReviewed, author, ratingValue: 2 },
        { itemReviewed: thirdItemReviewed, author, ratingValue: 48 },
        { itemReviewed: secondItemReviewed, author, ratingValue: 13 },
        { itemReviewed, author, ratingValue: 21 },
        { itemReviewed: secondItemReviewed, author, ratingValue: 13 },
        { itemReviewed, author, ratingValue: 31 },
        { itemReviewed: thirdItemReviewed, author, ratingValue: 23 },
        { itemReviewed, author, ratingValue: 12 },
        { itemReviewed, author, ratingValue: 17 },
        { itemReviewed: fourthItemReviewed, author, ratingValue: 12 },
      ]);

      expect(aggregateRatings).toHaveLength(4);
      expect(aggregateRatings).toEqual([
        {
          itemReviewed: thirdItemReviewed,
          ratingCount: 2,
          ratingValue: 35.5,
        },
        {
          itemReviewed,
          ratingCount: 5,
          ratingValue: 16.6,
        },
        {
          itemReviewed: secondItemReviewed,
          ratingCount: 2,
          ratingValue: 13,
        },
        {
          itemReviewed: fourthItemReviewed,
          ratingCount: 1,
          ratingValue: 12,
        },
      ]);
    });
  });
});
