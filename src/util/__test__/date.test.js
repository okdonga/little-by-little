import { generateDates} from '../date';

describe('generateDates', () => {
    it ('should return a range of dates in the format given', () => {
        expect(generateDates('2020-01-01', '2020-01-07', 'M/D/YY')).
        toEqual(["1/1/20", "1/2/20", "1/3/20", "1/4/20", "1/5/20", "1/6/20", "1/7/20"]);
    })
})