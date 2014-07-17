/* description: Parse invocations and property references */

/* lexical grammar */
%lex
%%

[\w\d_$]+\b           return 'VAR'
[-+]?[0-9]*\.?[0-9]+  return 'NUMBER'
\'[^']+\'             return 'SINGLE_QUOTED_STRING'
\"[^"]+\"             return 'DOUBLE_QUOTED_STRING'
"\""                  return 'DOUBLE_QUOTE'
"'"                   return 'SINGLE_QUOTE'
"("                   return '('
")"                   return ')'
"."                   return '.'
","                   return ','
";"                   return ';'
\s+                   /* skip whitespace */
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start statement

%%

/* language grammar */

statement
  : invocation EOF -> $$ = $invocation; return $invocation;
  | path EOF -> $$ = $path; return $path;
  ;

invocation
  : path '(' args ')' -> { type: 'invocation', path: $path, args: $args };
  ;

stringLiteral
  : SINGLE_QUOTED_STRING
  | DOUBLE_QUOTED_STRING
  ;

numberLiteral
  : NUMBER
  ;

literal
  : stringLiteral -> { type: 'literal', value: $stringLiteral };
  | numberLiteral -> { type: 'literal', value: $numberLiteral };
  ;

args
  : path -> $$ = [$1];
  | invocation -> $$ = [$1];
  | literal -> $$ = [$1];
  | args ',' literal -> $1.push($3); $$ = $1;
  | args ',' path -> $1.push($3); $$ = $1;
  |
  ;

path
  : VAR -> $$ = { type: 'path', path: [$1] };
  | path '.' VAR -> $1.path.push($3); $$ = $1;
  ;
