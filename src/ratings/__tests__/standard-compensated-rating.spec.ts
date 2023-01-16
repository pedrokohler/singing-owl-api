import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../ratings.service';
import { createCreativeWork } from './creative-work.factory';

describe('Compensated rating strategy', () => {
  let ratingsService: RatingsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [RatingsService],
    }).compile();

    ratingsService = app.get<RatingsService>(RatingsService);
  });

  describe('Given an array of ratings', () => {
    it('should return null if the array is empty', () => {
      const aggregateRatings =
        ratingsService.computeStandardCompensatedAggregateRatings([]);
      expect(aggregateRatings).toBeNull();
    });
    it('should return null in a scenario with one single player', () => {
      const aggregateRatings =
        ratingsService.computeStandardCompensatedAggregateRatings([
          {
            author: 'author-id',
            ratingValue: 13,
            itemReviewed: createCreativeWork(),
          },
        ]);
      expect(aggregateRatings).toBeNull();
    });

    it('should compute the aggregate rating in a scenario with two authors and two items reviewed', () => {
      const firstAuthor = 'author-id';
      const secondAuthor = 'another-author';
      const firstItemReviewed = createCreativeWork({
        owner: secondAuthor,
      });
      const secondItemReviewed = createCreativeWork({
        id: 'another-item',
        owner: firstAuthor,
      });

      const aggregateRatings =
        ratingsService.computeStandardCompensatedAggregateRatings([
          {
            author: firstAuthor,
            ratingValue: 60,
            itemReviewed: firstItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 20,
            itemReviewed: secondItemReviewed,
          },
        ]);
      expect(aggregateRatings).toMatchObject(
        expect.arrayContaining([
          {
            itemReviewed: firstItemReviewed,
            ratingValue: (60 + 20) / 2,
            ratingCount: 2,
          },
          {
            itemReviewed: secondItemReviewed,
            ratingValue: (20 + 60) / 2,
            ratingCount: 2,
          },
        ]),
      );
    });

    it("should compute the aggregate rating in a scenario with an owner that didn't rate yet", () => {
      const firstAuthor = 'author-id';
      const secondAuthor = 'another-author';
      const thirdAuthor = 'yet-another-author';
      const firstItemReviewed = createCreativeWork({
        owner: firstAuthor,
      });
      const secondItemReviewed = createCreativeWork({
        id: 'another-item',
        owner: secondAuthor,
      });
      const thirdItemReviewed = createCreativeWork({
        id: 'yet-another-item',
        owner: thirdAuthor,
      });

      const aggregateRatings =
        ratingsService.computeStandardCompensatedAggregateRatings([
          {
            author: firstAuthor,
            ratingValue: 60,
            itemReviewed: secondItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 80,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 50,
            itemReviewed: firstItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 90,
            itemReviewed: thirdItemReviewed,
          },
        ]);
      expect(aggregateRatings).toMatchObject(
        expect.arrayContaining([
          {
            itemReviewed: firstItemReviewed,
            ratingValue: (50 + (60 + 80) / 2) / 2,
            ratingCount: 2,
          },
          {
            itemReviewed: secondItemReviewed,
            ratingValue: (60 + (50 + 90) / 2) / 2,
            ratingCount: 2,
          },
          {
            itemReviewed: thirdItemReviewed,
            ratingValue: (80 + 90) / 2,
            ratingCount: 2,
          },
        ]),
      );
    });
  });
});
