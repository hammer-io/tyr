//Sample test
import assert from 'assert'

// Tests need to import transpiled files that will be located in dist/ rather than src/

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.equal(-1, [1,2,3].indexOf(4))
    })
  })
})