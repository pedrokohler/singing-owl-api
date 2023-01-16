import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../ratings.service';
import { createCreativeWork } from './creative-work.factory';

describe('Heavily compensated strategy', () => {
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
        ratingsService.computeHeavilyCompensatedAggregateRatings([]);
      expect(aggregateRatings).toBeNull();
    });

    it('should compute the aggregate rating in a scenario with multiple authors', () => {
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
        ratingsService.computeHeavilyCompensatedAggregateRatings([
          {
            author: firstAuthor,
            ratingValue: 10,
            itemReviewed: secondItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 20,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 60,
            itemReviewed: firstItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 70,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 50,
            itemReviewed: firstItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 30,
            itemReviewed: secondItemReviewed,
          },
        ]);
      expect(aggregateRatings).toMatchObject(
        expect.arrayContaining([
          {
            itemReviewed: firstItemReviewed,
            ratingValue: ((60 + 50) / 2 + (10 + 20) / 2) / 2,
            ratingCount: 3,
          },
          {
            itemReviewed: secondItemReviewed,
            ratingValue: ((10 + 30) / 2 + (60 + 70) / 2) / 2,
            ratingCount: 3,
          },
          {
            itemReviewed: thirdItemReviewed,
            ratingValue: ((20 + 70) / 2 + (50 + 30) / 2) / 2,
            ratingCount: 3,
          },
        ]),
      );
    });

    it("should compute the aggregate rating in a scenario with an owner that didn't rate yet", () => {
      const firstAuthor = 'author-id';
      const secondAuthor = 'another-author';
      const thirdAuthor = 'yet-another-author';
      const owner = 'owner-id';
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
      const fourthItemReviewed = createCreativeWork({
        id: 'yet-another-item-again',
        owner: owner,
      });

      const aggregateRatings =
        ratingsService.computeHeavilyCompensatedAggregateRatings([
          {
            author: firstAuthor,
            ratingValue: 10,
            itemReviewed: secondItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 20,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 90,
            itemReviewed: fourthItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 60,
            itemReviewed: firstItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 70,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 81,
            itemReviewed: fourthItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 50,
            itemReviewed: firstItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 30,
            itemReviewed: secondItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 13,
            itemReviewed: fourthItemReviewed,
          },
        ]);
      expect(aggregateRatings).toMatchObject(
        expect.arrayContaining([
          {
            itemReviewed: firstItemReviewed,
            ratingValue: parseFloat(
              (((60 + 50) / 2 + (10 + 20 + 90) / 3) / 2).toFixed(2),
            ),
            ratingCount: 3,
          },
          {
            itemReviewed: secondItemReviewed,
            ratingValue: 45.16, // rounding error
            ratingCount: 3,
          },
          {
            itemReviewed: thirdItemReviewed,
            ratingValue: parseFloat(
              (((20 + 70) / 2 + (50 + 30 + 13) / 3) / 2).toFixed(2),
            ),
            ratingCount: 3,
          },
          {
            itemReviewed: fourthItemReviewed,
            ratingValue: parseFloat(((13 + 81 + 90) / 3).toFixed(2)),
            ratingCount: 3,
          },
        ]),
      );
    });

    it('should compute the aggregate rating in a scenario with more items than owners', () => {
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
      const fourthItemReviewed = createCreativeWork({
        id: 'yet-another-item-again',
        owner: thirdAuthor,
      });

      const aggregateRatings =
        ratingsService.computeHeavilyCompensatedAggregateRatings([
          {
            author: firstAuthor,
            ratingValue: 10,
            itemReviewed: secondItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 20,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 60,
            itemReviewed: fourthItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 60,
            itemReviewed: firstItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 70,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 80,
            itemReviewed: fourthItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 50,
            itemReviewed: firstItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 30,
            itemReviewed: secondItemReviewed,
          },
        ]);
      expect(aggregateRatings).toMatchObject(
        expect.arrayContaining([
          {
            itemReviewed: firstItemReviewed,
            ratingValue: ((60 + 50) / 2 + (10 + 20 + 60) / 3) / 2,
            ratingCount: 3,
          },
          {
            itemReviewed: secondItemReviewed,
            ratingValue: ((10 + 30) / 2 + (60 + 70 + 80) / 3) / 2,
            ratingCount: 3,
          },
          {
            itemReviewed: thirdItemReviewed,
            ratingValue: ((20 + 70) / 2 + (50 + 30) / 2) / 2,
            ratingCount: 3,
          },
          {
            itemReviewed: fourthItemReviewed,
            ratingValue: ((80 + 60) / 2 + (50 + 30) / 2) / 2,
            ratingCount: 3,
          },
        ]),
      );
    });

    it('should order the aggregate ratings of each item reviewed in a descending order', () => {
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
        ratingsService.computeHeavilyCompensatedAggregateRatings([
          {
            author: firstAuthor,
            ratingValue: 40,
            itemReviewed: secondItemReviewed,
          },
          {
            author: firstAuthor,
            ratingValue: 20,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 60,
            itemReviewed: firstItemReviewed,
          },
          {
            author: secondAuthor,
            ratingValue: 65,
            itemReviewed: thirdItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 50,
            itemReviewed: firstItemReviewed,
          },
          {
            author: thirdAuthor,
            ratingValue: 30,
            itemReviewed: secondItemReviewed,
          },
        ]);
      expect(aggregateRatings).toEqual([
        {
          itemReviewed: secondItemReviewed,
          ratingValue: ((40 + 30) / 2 + (60 + 65) / 2) / 2,
          ratingCount: 3,
        },
        {
          itemReviewed: firstItemReviewed,
          ratingValue: ((60 + 50) / 2 + (40 + 20) / 2) / 2,
          ratingCount: 3,
        },
        {
          itemReviewed: thirdItemReviewed,
          ratingValue: ((20 + 65) / 2 + (50 + 30) / 2) / 2,
          ratingCount: 3,
        },
      ]);
    });
  });
});
