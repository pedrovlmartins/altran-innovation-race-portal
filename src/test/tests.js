/**
 * Created by Afonso on 25/03/2017.
 */

var assert = require('assert');
var chai = require('chai');
var chaiHttp = require('chai-http');

describe('Array', function () {
  describe('#indexOf()', function () {
      it('should return -1 when the value is not present', function () {
          assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });
});
