module.exports = {
  ROUTINE_TYPES: {
    EYE: 'eye',
    TRAINING: 'training'
  },

  EYE_ROUTINES: [
    'BLINK_TRAINING',
    'EYE_DROP_TIMER',
    '20_20_20_TIMER',
    'WARM_COMPRESS',
    'EYE_CLEANING',
    'LAUGH_EXERCISE'
  ],

  TRAINING_ROUTINES: [
    'home workout',
    'walk',
    'strength training',
    'stretch',
    'meal plan'
  ],

  DEFAULT_EYE_GOALS: {
    'blink training': 3,
    'eye drop timer': 3,
    '20-20-20 timer': 2,
    'warm compress': 1,
    'eye cleaning': 1,
    'laugh exercise': 1
  },

  DEFAULT_TRAINING_GOALS: {
    'home workout': 1,
    'walk': 1,
    'strength training': 1,
    'stretch': 1,
    'meal plan': 1
  }
};
