import Moment from 'moment';
import { extendMoment } from 'moment-range'

const moment = extendMoment(Moment);

export const generateDates = (start, end, format) => {
    const range = moment.range(start, end);
    return Array.from(range.by('day')).map(x => x.format(format));
}



