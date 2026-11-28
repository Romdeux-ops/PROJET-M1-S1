import { defaultProfile, type MockMatchProfile, type MockUser } from '../db'
import { compatibility } from './matching'

/**
 * Parite du bareme FitMatch entre les mocks et le backend : memes cas et memes
 * resultats que `CompatibilityTests.java`. Si l'un change, l'autre doit suivre.
 */
function athlete(overrides: Partial<MockMatchProfile> = {}): MockMatchProfile {
  return {
    userId: 'a',
    side: 'ATHLETE',
    headline: 'Athlete',
    about: null,
    sports: ['STRENGTH', 'RUNNING'],
    goals: [],
    levels: [],
    availability: ['EVENING', 'WEEKEND'],
    trainingMode: 'ONSITE',
    city: 'Lyon',
    maxBudgetEur: 30,
    sessionRateEur: null,
    visible: true,
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

function coach(overrides: Partial<MockMatchProfile> = {}): MockMatchProfile {
  return {
    ...athlete(),
    userId: 'c',
    side: 'COACH',
    goals: ['MUSCLE_GAIN'],
    levels: ['BEGINNER'],
    trainingMode: 'BOTH',
    city: 'LYON',
    maxBudgetEur: null,
    sessionRateEur: 30,
    ...overrides,
  }
}

function athleteUser(
  fitnessGoal: MockUser['profile']['fitnessGoal'],
  experienceLevel: MockUser['profile']['experienceLevel'],
): MockUser {
  return {
    id: 'a',
    email: 'a@fitmatch.demo',
    firstName: 'A',
    lastName: 'B',
    roles: ['ATHLETE'],
    password: 'x',
    profile: { ...defaultProfile(), fitnessGoal, experienceLevel },
  }
}

describe('bareme FitMatch des mocks', () => {
  it('donne 100 pour un accord parfait', () => {
    const result = compatibility(athlete(), athleteUser('MUSCLE_GAIN', 'BEGINNER'), coach())

    expect(result.score).toBe(100)
    expect(result.reasons).toEqual([
      'SHARED_SPORTS',
      'GOAL_SUPPORTED',
      'LEVEL_SUPPORTED',
      'SHARED_AVAILABILITY',
      'SAME_CITY',
      'WITHIN_BUDGET',
    ])
  })

  it('donne 0 sans rien en commun', () => {
    const result = compatibility(
      athlete(),
      athleteUser('ENDURANCE', 'ADVANCED'),
      coach({
        sports: ['YOGA'],
        availability: ['MORNING'],
        trainingMode: 'ONSITE',
        city: 'Paris',
        sessionRateEur: 90,
      }),
    )

    expect(result.score).toBe(0)
    expect(result.reasons).toEqual([])
  })

  it('recompense partiellement un accord partiel', () => {
    const result = compatibility(
      athlete({ trainingMode: 'BOTH', city: 'Marseille', maxBudgetEur: null }),
      athleteUser('ENDURANCE', 'ADVANCED'),
      coach({ sports: ['RUNNING'], goals: [], levels: [], availability: ['EVENING'] }),
    )

    expect(result.score).toBe(58)
    expect(result.reasons).toEqual(['SHARED_SPORTS', 'SHARED_AVAILABILITY', 'REMOTE_POSSIBLE'])
  })
})
