import describeDB from './describeDB'
import analizer from '../../../src/consumer/persistence/analyzer'

describeDB('Seed', () => {
  test('Running on full db', async () => {
    const count = await analizer.solutionsCount()
    expect(count).toBeGreaterThan(0)
  })
})