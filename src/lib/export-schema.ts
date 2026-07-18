import { z } from "zod";

export const EXPORT_VERSION = 1;

const ratingExportSchema = z.object({
  overallScore: z.number(),
  plotScore: z.number().nullable().optional(),
  actingScore: z.number().nullable().optional(),
  emotionScore: z.number().nullable().optional(),
  pacingScore: z.number().nullable().optional(),
  musicScore: z.number().nullable().optional(),
  endingScore: z.number().nullable().optional(),
  rewatchValue: z.boolean().optional(),
});

const libraryEntrySchema = z.object({
  tmdbId: z.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  originalTitle: z.string().optional().default(""),
  posterPath: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
  genres: z.array(z.string()).optional().default([]),
  countries: z.array(z.string()).optional().default([]),
  runtime: z.number().nullable().optional(),
  status: z.string().min(1),
  personalScore: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  favorite: z.boolean().optional().default(false),
  priority: z.number().int().optional().default(0),
  currentEpisode: z.number().int().optional().default(0),
  totalEpisodes: z.number().int().optional().default(1),
  rating: ratingExportSchema.nullable().optional(),
  review: z.object({ content: z.string(), spoilers: z.boolean().optional() }).nullable().optional(),
});

const listExportSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().nullable().optional(),
  isPublic: z.boolean().optional().default(false),
  itemTmdbIds: z.array(z.number().int()).optional().default([]),
});

const preferencesExportSchema = z
  .object({
    favGenres: z.array(z.string()).optional().default([]),
    favCountries: z.array(z.string()).optional().default([]),
    preferTvShows: z.boolean().optional().default(false),
    theme: z.string().optional(),
    language: z.string().optional(),
    ratingScale: z.string().optional(),
  })
  .nullable();

export const importSchema = z.object({
  version: z.number().optional(),
  preferences: preferencesExportSchema.optional(),
  library: z.array(libraryEntrySchema).optional().default([]),
  lists: z.array(listExportSchema).optional().default([]),
});

export type ImportPayload = z.infer<typeof importSchema>;
export type LibraryEntry = z.infer<typeof libraryEntrySchema>;
