def parse_timestamp(timestamp):
    date, time = timestamp.split('-')
    month, day = date.split('/')
    hour, minute, second_microsecond = time.split(':')
    second, microsecond = second_microsecond.split('.')
    return {
        'month': int(month),
        'day': int(day),
        'hour': int(hour),
        'minute': int(minute),
        'second': int(second),
        'microsecond': int(microsecond)
    }


def milliseconds_lapsed_in_day(timestamp):
    hours = timestamp['hour']
    minutes = hours * 60 + timestamp['minute']
    seconds = minutes * 60 + timestamp['second']
    milliseconds = seconds * 1000 + timestamp['microsecond'] // 1000
    return milliseconds


def difference_in_milliseconds(first, second):
    first = parse_timestamp(first)
    second = parse_timestamp(second)

    milliseconds_per_day = 24 * 60 * 60 * 1000
    difference = milliseconds_lapsed_in_day(
        second) - milliseconds_lapsed_in_day(first)

    if first['month'] != second['month'] or first['day'] != second['day']:
        difference += milliseconds_per_day

    return difference
