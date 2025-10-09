//from conjure-oxide tree-sitter. had to remove grammar(), also consider installing treesitter, might be more readable
import { seq, choice, repeat, optional, prec} from "./predefinedFunctions";

export const grammar = {
  name: 'essence',

  rules: {
    //top-level statements
    program: $ => choice(
        $.find_statement_list,
        $.constraint_list,
        $.letting_statement_list,
        $.given_list,
        $.dominance_relation
    ),

    // TODO: Do we want comments later -- yes
    // single_line_comment: $ => token(seq('$', /.*/)),

    // language_declaration: $ => token(seq("language", /.*/)),

    //general
    constant: $ => choice(
        $.integer,
        $.TRUE,
        $.FALSE
    ),

    integer: $ => /-?[0-9]+/,

    TRUE: $ => "true",

    FALSE: $ => "false",

    //need to replace soon
    variable: $ => {
    },

    variable_list: $ => repeat(seq(
        ",",
        $.variable
    ))
    ,

    //find statements
    find_statement_list: $ => seq("find", repeat($.find_statement)),

    find_statement: $ => seq(
        $.variable_list,
        ":",
        $.domain,
        optional(",")
    ),

    // as range list, ensure list properly
    /*variable_list: $ => seq(
      $.variable,
      optional(repeat(seq(
        ",",
        $.variable
      )))
    ),*/


    domain: $ => choice(
        $.bool_domain,
        $.int_domain,
        $.variable
    ),

    bool_domain: $ => "bool",

    // removed prec.left (add back in)
    int_domain: $ => seq(
        "int",
        optional(seq(
            "(",
            $.range_list,
            //TODO: eventually add in expressions here
            ")"
        ))
    ),

    // range_list: $ => prec(2, seq(
    //   choice(
    //     $.int_range,
    //     $.integer
    //   ),
    //   optional(repeat(seq(
    //     ",",
    //     choice(
    //       $.int_range,
    //       $.integer
    //     ),
    //   )))
    // )),

    // remove precedence, so don't get duplicate brackets, also ensures list corrects
    range_list: $ => repeat(seq(",", choice($.int_range, $.integer))),

    int_range: $ => seq(optional($.expression), "..", optional($.expression)),

    //letting statements
    letting_statement_list: $ => seq("letting", repeat($.letting_statement)),

    letting_statement: $ => seq(
        $.variable_list,
        "be",
        choice($.expression, seq("domain", $.domain))
    ),

    // adding given so can demonstrate data entry
    given_list: $ => seq("given", repeat(seq($.find_statement))),

    //constraints
    constraint_list: $ => seq("such that", repeat(seq($.expression, optional(",")))),
    // separated out for
    bracket_expr: $ => seq("(", $.expression, ")"),
    domain_expr: $ => seq("domain", $.domain),

    expression: $ => choice(
        $.bracket_expr,
        // $.metavar, // she doesnt even go here
        $.not_expr,
        $.abs_value,
        $.exponent,
        $.negative_expr,
        $.product_expr,
        $.sum_expr,
        $.comparison,
        $.and_expr,
        $.or_expr,
        $.implication,
        $.quantifier_expr,
        $.expr_list,
        $.constant,
        $.variable,
        $.comparing,
        $.additive,
        $.muliplicative,
        $.from_solution,
    ),

    not_expr: $ => prec(20, seq("!", $.expression)),

    abs_value: $ => prec(20, seq("|", $.expression, "|")),

    exponent: $ => prec(18, prec.right(seq($.expression, "**", $.expression))),

    negative_expr: $ => prec(15, prec.left(seq("-", $.expression))),

    product_expr: $ => prec(10, prec.left(seq($.expression, $.multiplicative_op, $.expression))),

    multiplicative_op: $ => choice("*", "/", "%"),

    sum_expr: $ => prec(1, prec.left(seq($.expression, $.additive_op, $.expression))),

    additive_op: $ => choice("+", "-"),

    comparison: $ => prec(0, prec.left(seq($.expression, $.comp_op, $.expression))),

    comp_op: $ => choice("=", "!=", "<=", ">=", "<", ">"),

    and_expr: $ => prec(-1, prec.left(seq($.expression, "/\\", $.expression))),

    or_expr: $ => prec(-2, prec.left(seq($.expression, "\\/", $.expression))),

    implication: $ => prec(-4, prec.left(seq($.expression, "->", $.expression))),

    toInt_expr: $ => seq("toInt", "(", $.expression, ")"),

    quantifier_expr: $ => prec(-10, seq(
        choice("and", "or", "min", "max", "sum", "allDiff"),
        "([",
        $.expr_list,
        "])"
    )),

    expr_list: $ => repeat(seq(
        $.expression,
        optional(",")
    )),


    //adding other toolbox/colour only categories
    muliplicative: $ => choice(
        $.product_expr,
        $.multiplicative_op
    ),

    additive: $ => choice(
        $.additive_op,
        $.sum_expr
    ),

    from_solution: $ => seq(
        "fromSolution",
        "(",
        $.variable,
        ")"
    ),

    dominance_relation: $ => seq(
        "dominanceRelation",
        $.expression
    ),

    // defining categories.
    comparing: $ => choice(
        $.comparison,
        $.comp_op
    ),

    find: $ => choice(
        $.find_statement,
        $.find_statement_list,
        $.given_list
    ),

    letting: $ => choice(
        $.letting_statement,
        $.letting_statement_list
    ),

    range: $ => choice(
        $.int_range,
        $.range_list
    )
  }
};