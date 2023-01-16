import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../ratings.service';
import { createCreativeWork } from './creative-work.factory';

describe('Penalty rating strategy', () => {
  let ratingsService: RatingsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [RatingsService],
    }).compile();

    ratingsService = app.get<RatingsService>(RatingsService);
  });

  describe('Given an array of ratings', () => {
    it('should return null if the array is empty', () => {
      const aggregateRatings = ratingsService.computePenaltyAggregateRatings(
        [],
      );
      expect(aggregateRatings).toBeNull();
    });
    it('should return null in a scenario with one single player', () => {
      const aggregateRatings = ratingsService.computePenaltyAggregateRatings([
        {
          author: 'author-id',
          ratingValue: 13,
          itemReviewed: createCreativeWork(),
        },
      ]);
      expect(aggregateRatings).toBeNull();
    });

    it('should compute the aggregate rating in a scenario with two ratings and two items reviewed', () => {
      const firstAuthor = 'author-id';
      const secondAuthor = 'another-author';
      const firstItemReviewed = createCreativeWork({
        owner: secondAuthor,
      });
      const secondItemReviewed = createCreativeWork({
        id: 'another-item',
        owner: firstAuthor,
      });

      const aggregateRatings = ratingsService.computePenaltyAggregateRatings([
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
          { itemReviewed: firstItemReviewed, ratingValue: 40, ratingCount: 2 },
          { itemReviewed: secondItemReviewed, ratingValue: 40, ratingCount: 2 },
        ]),
      );
    });

  });
});
