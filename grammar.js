/* eslint-disable arrow-parens */
/* eslint-disable camelcase */
/* eslint-disable-next-line spaced-comment */
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const {commaSep1} = require('./grammar/utils.js');
const types = require('./grammar/types.js');
const expressions = require('./grammar/expressions.js');
const functions = require('./grammar/functions.js');
const statements = require('./grammar/statements.js');

module.exports = grammar({
  name: 'func',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  word: $ => $.identifier,

  rules: {
    translation_unit: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $.function_definition,
      $.include_directive,
      $.pragma_directive,
      $.global_var_declarations,
      $.const_var_declarations,
    ),

    include_directive: $ => seq(
      '#include',
      alias($._string_literal, $.include_path),
      ';',
    ),

    pragma_directive: $ => seq(
      '#pragma',
      choice('version', 'not-version', 'test-version-set'),
      optional(alias(/(\^|<=|>=|<|>|=)/, $.version_operator)),
      optional('"'),
      alias(/\d/, $.major_version),
      optional(
        seq(
          '.',
          // Rename if incorrect
          alias(/\d/, $.minor_version),
          optional(seq('.', alias(/\d/, $.patch_version))),
        ),
      ),
      optional('"'),
      ';',
    ),

    global_var_declarations: $ => seq(
      'global',
      commaSep1($._global_var_declaration),
      ';',
    ),

    const_var_declarations: $ => seq(
      'const',
      optional(field('type', $._type)),
      commaSep1($._const_var_declaration),
      ';',
    ),

    _global_var_declaration: $ => seq(
      field('type', optional($._type)),
      field('name', $.identifier),
    ),

    _const_var_declaration: $ => seq(
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    ...types,
    ...expressions,
    ...functions,
    ...statements,

    number: _ => token(seq(
      optional('-'),
      choice(
        seq('0x', /[0-9a-fA-F]+/),
        /[0-9]+/,
      ),
    )),

    string: $ => choice(
      $._string_literal,
      $._raw_slice_const,
      $._slice_const_address,
      $._int_const_hex,
      $._string_sha_first_32,
      $._string_sha_256,
      $._string_crc_32,
    ),
    _string_literal: _ => /"[^"]*"/,
    _raw_slice_const: $ => seq($._string_literal, alias('s', $.string_type)),
    _slice_const_address: $ => seq($._string_literal, alias('a', $.string_type)),
    _int_const_hex: $ => seq($._string_literal, alias('u', $.string_type)),
    _string_sha_first_32: $ => seq($._string_literal, alias('h', $.string_type)),
    _string_sha_256: $ => seq($._string_literal, alias('H', $.string_type)),
    _string_crc_32: $ => seq($._string_literal, alias('c', $.string_type)),

    // actually FunC identifiers are much more flexible
    identifier: _ => /(`.*`)|([a-zA-Z_](\w|['?:])+)|([a-zA-Z])/,
    underscore: _ => '_',

    // multiline_comment: $ => seq('{-', repeat(choice(/./, $.multiline_comment)), '-}'),
    // unfortunately getting panic while generating parser with support for nested comments
    comment: _ => {
      let multiline_comment = seq('{-', /[^-]*-+([^-}][^-]*-+)*/, '}'); // C-style multiline comments (without nesting)
      // manually support some nesting
      for (let i = 0; i < 5; i++) {
        multiline_comment = seq('{-', repeat(choice(/[^-{]/, /-[^}]/, /\{[^-]/, multiline_comment)), '-}');
      }
      return token(choice(
        seq(';;', /[^\n]*/), // single-line comment
        multiline_comment,
      ));
    },
  },
});
