import { numberWithCommas} from '../number';

describe('numberWithCommas', () => {
    it ('should return number with commas', () => {
        expect(numberWithCommas(2000)).toEqual('2,000');
        expect(numberWithCommas(2)).toEqual('2');
        expect(numberWithCommas(2000000)).toEqual('2,000,000');
    })
})