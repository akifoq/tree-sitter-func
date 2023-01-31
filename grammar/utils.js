/**
* Creates a rule to optionally match one or more of the rules separated by the separator
*
* @param {string} sep - The separator to use.
* @param {Rule} rule
*
* @return {SeqRule}
*
*/
function sep(sep, rule) {
  return optional(sep1(sep, rule));
}

/**
* Creates a rule to match one or more of the rules separated by the separator
*
* @param {string} sep - The separator to use.
* @param {Rule} rule
*
* @return {SeqRule}
*
*/
function sep1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

/**
* Creates a rule to match two or more of the rules separated by the separator
*
* @param {string} sep - The separator to use.
* @param {Rule} rule
*
* @return {SeqRule}
*
*/
function sep2(sep, rule) {
  return seq(rule, repeat1(seq(sep, rule)));
}

/**
* Creates a rule to optionally match one or more of the rules separated by a comma
*
* @param {Rule} rule
*
* @return {SeqRule}
*
*/
const commaSep = (rule) => sep(',', rule);

/**
* Creates a rule to match one or more of the rules separated by a comma
*
* @param {Rule} rule
*
* @return {SeqRule}
*
*/
const commaSep1 = (rule) => sep1(',', rule);

/**
* Creates a rule to match two or more of the rules separated by a comma
*
* @param {Rule} rule
*
* @return {SeqRule}
*
*/
const commaSep2 = (rule) => sep2(',', rule);

module.exports = {
  sep,
  sep1,
  sep2,
  commaSep,
  commaSep1,
  commaSep2,
};
