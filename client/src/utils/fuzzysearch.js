function fuzzysearch(needle, haystack) {
  var hlen = haystack.length;
  var nlen = needle.length;
  let score = 0;
  let prev = -1;
  if (nlen > hlen) {
    return 0;
  }
  if (nlen === hlen) {
    return needle === haystack;
  }
  outer: for (var i = 0, j = 0; i < nlen; i++) {
    var nch = needle.charCodeAt(i);
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === nch) {
        score += 1 - (j - 1 - prev - 1.0) / (hlen - prev - 1);
        if (prev + 1 == j - 1) score += 1;
        prev = j - 1;
        continue outer;
      }
    }
    return 0;
  }
  return score;
}

module.exports = fuzzysearch;
