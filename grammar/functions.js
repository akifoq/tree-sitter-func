/* eslint-disable arrow-parens */

const {commaSep} = require('./utils.js');

module.exports = {
  function_definition: $ => seq(
    field('type_variables', optional($.type_variables_list)),
    field('return_type', $._type),
    field('name', $.function_name),
    field('arguments', $.parameter_list),
    field('specifiers', seq(
      optional('impure'),
      optional($.inline),
      optional($.method_id),
    )),
    choice(
      ';',
      field('body', $.block_statement),
      field('asm_body', $.asm_function_body),
    ),
  ),

  function_name: _ => /(`.*`)|((\.|~)?(([a-zA-Z_](\w|['?:])+)|([a-zA-Z])))/,

  inline: _ => choice('inline', 'inline_ref'),
  method_id: $ => seq('method_id', optional(
    seq('(', choice($.number, $.string), ')'),
  )),

  type_variables_list: $ => seq(
    'forall',
    commaSep(seq(optional('type'), $.type_identifier)),
    '->',
  ),

  parameter_list: $ => seq(
    '(',
    commaSep($.parameter_declaration),
    ')',
  ),

  parameter_declaration: $ => prec(1, choice(
    seq(
      optional(field('type', $._type)), // int
      alias(choice(
        field('name', $.identifier), // myint OR
        $.underscore, // _
      ), $.parameter),
    ),
    field('type', $._type), // just `int`
  )),

  asm_function_body: $ => seq(
    $.asm_specifier,
    repeat1($.asm_instruction),
    ';',
  ),

  asm_specifier: $ => seq(
    'asm',
    optional(seq(
      '(',
      repeat(alias($.identifier, $.parameter)),
      optional(seq(
        '->',
        repeat($.number),
      )),
      ')',
    )),
  ),
  asm_instruction: $ => choice(
    prec(2, $.multiline_asm_instruction),
    prec(1, alias(token(/"[^"]*"/), $.asm_instruction)),
  ),
  multiline_asm_instruction: $ => seq(
    '"""',
    repeat(
      alias($._multiline_string_fragment, $.multiline_string_fragment),
    ),
    '"""',
  ),
  _multiline_string_fragment: () =>
    prec.right(choice(
      /[^"]+/,
      seq(/"[^"]*"/, repeat(/[^"]+/)),
    )),
};
