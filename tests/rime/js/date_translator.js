export class DateTranslator {
  translate(input, segment, env) {
    if (input === 'dt') {
      return [
        new Candidate('date', segment.start, segment.end, new Date().toLocaleDateString(), '', 100)
      ]
    }
    return []
  }
}
